const convexClient = require("../config/convex");
const { anyApi } = require("convex/server");
const { logEvent } = require("../middleware/logAudit");
const { publish } = require("../services/notification");
const { sendAssignment, sendReportStatus } = require("../services/email");

const getReports = async (req, res) => {
  const { status, assignedTo, search, sortBy } = req.query;
  let reports = await convexClient.query(anyApi.reports.getReports, {
    status: status || undefined,
    assignedTo: assignedTo || undefined,
    limit: 200,
  });

  const mapped = reports.map((r) => ({
    _id: r._id,
    name: r.name,
    phone: r.phone,
    category: r.category,
    animalType: r.animalType,
    urgency: r.urgency,
    location: r.location,
    description: r.description,
    images: JSON.parse(r.images || "[]"),
    status: r.status,
    assignedTo: r.assignedTo || null,
    latitude: r.latitude ?? null,
    longitude: r.longitude ?? null,
    createdAt: r.createdAt,
  }));

  if (search) {
    const q = search.toLowerCase();
    const filtered = mapped.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.animalType.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
    );
    return res.json({ reports: filtered });
  }

  if (sortBy === "urgency") {
    const order = { emergency: 0, high: 1, medium: 2, low: 3 };
    mapped.sort((a, b) => (order[a.urgency] ?? 99) - (order[b.urgency] ?? 99));
  } else if (sortBy === "oldest") {
    mapped.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
  } else {
    mapped.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }

  res.json({ reports: mapped });
};

const rejectAssignment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.uuid;

  await convexClient.mutation(anyApi.reports.rejectAssignment, { reportId: id });

  await convexClient.mutation(anyApi.activity.insertActivityLog, {
    userId,
    action: "rejected",
    reportId: id,
    details: `Rejected assignment`,
  });

  await logEvent({
    req,
    userId,
    eventType: "report_rejected",
    metadata: { reportId: id },
  });

  const { publish } = require("../services/notification");
  await publish({
    type: "report:rejected",
    reportId: id,
    updatedBy: userId,
    timestamp: Date.now(),
  });

  res.json({ message: "Assignment rejected." });
};

const updateLocation = async (req, res) => {
  const userId = req.user.uuid;
  const { latitude, longitude } = req.body;

  if (latitude == null || longitude == null) {
    return res.status(400).json({ message: "Latitude and longitude are required." });
  }

  const user = await convexClient.query(anyApi.users.getUserByUuid, { uuid: userId });
  const userName = user ? `${user.firstName} ${user.lastName}` : userId;

  await convexClient.mutation(anyApi.locations.updateRescuerLocation, {
    userId,
    userName,
    latitude,
    longitude,
  });

  res.json({ message: "Location updated." });
};

const updateReportStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.uuid;

  if (!["pending", "assigned", "en_route", "in_progress", "resolved", "failed"].includes(status)) {
    return res.status(400).json({ message: "Invalid status." });
  }

  await convexClient.mutation(anyApi.reports.updateReportStatus, {
    reportId: id,
    status,
  });

  await convexClient.mutation(anyApi.activity.insertActivityLog, {
    userId,
    action: `status:${status}`,
    reportId: id,
    details: `Updated status to ${status.replace("_", " ")}`,
  });

  await logEvent({
    req,
    userId,
    eventType: "report_status",
    metadata: { reportId: id, newStatus: status },
  });

  try {
    await sendReportStatus(userId, "Animal", id, status);
  } catch {}

  await publish({
    type: "report:status",
    reportId: id,
    status,
    updatedBy: userId,
    timestamp: Date.now(),
  });

  res.json({ message: `Report status updated to ${status}.`, status });
};

const getStats = async (req, res) => {
  const userId = req.user.uuid;
  const stats = await convexClient.query(anyApi.reports.getRescuerStats, { uuid: userId });

  const recentReports = await convexClient.query(anyApi.reports.getReports, {
    assignedTo: userId,
    limit: 10,
  });

  const mapped = recentReports.map((r) => ({
    _id: r._id,
    name: r.name,
    category: r.category,
    animalType: r.animalType,
    urgency: r.urgency,
    status: r.status,
    createdAt: r.createdAt,
  }));

  const user = await convexClient.query(anyApi.users.getUserByUuid, { uuid: userId });

  res.json({
    ...stats,
    recentReports: mapped,
    availability: user?.availability || null,
  });
};

const updateProfile = async (req, res) => {
  const { firstName, lastName, phoneNumber } = req.body;
  const userId = req.user.uuid;

  await convexClient.mutation(anyApi.users.updateUser, {
    uuid: userId,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    phoneNumber: phoneNumber || undefined,
  });

  await logEvent({
    req,
    userId,
    eventType: "profile_update",
    metadata: { firstName, lastName, phoneNumber },
  });

  const updated = await convexClient.query(anyApi.users.getUserByUuid, { uuid: userId });
  const { password, ...safeUser } = updated;
  res.json({ message: "Profile updated.", user: safeUser });
};

const getActivity = async (req, res) => {
  const userId = req.user.uuid;
  const logs = await convexClient.query(anyApi.activity.getActivityLogs, {
    userId,
    limit: 100,
  });
  res.json({ activity: logs });
};

const updateAvailability = async (req, res) => {
  const userId = req.user.uuid;
  const { availability } = req.body;

  if (!["available", "busy"].includes(availability)) {
    return res.status(400).json({ message: "Invalid availability value." });
  }

  await convexClient.mutation(anyApi.users.updateAvailability, {
    uuid: userId,
    availability,
  });

  await convexClient.mutation(anyApi.activity.insertActivityLog, {
    userId,
    action: "availability",
    details: `Set status to ${availability}`,
  });

  res.json({ message: `You are now marked as ${availability}.`, availability });
};

const addNote = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.uuid;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ message: "Note content is required." });
  }

  const user = await convexClient.query(anyApi.users.getUserByUuid, { uuid: userId });
  const userName = user ? `${user.firstName} ${user.lastName}` : userId;

  await convexClient.mutation(anyApi.notes.addReportNote, {
    reportId: id,
    userId,
    userName,
    content: content.trim(),
  });

  res.json({ message: "Note added." });
};

const getNotes = async (req, res) => {
  const { id } = req.params;
  const notes = await convexClient.query(anyApi.notes.getReportNotes, {
    reportId: id,
  });
  res.json({ notes });
};

module.exports = {
  getReports,
  updateReportStatus,
  getStats,
  updateProfile,
  getActivity,
  updateAvailability,
  addNote,
  getNotes,
  updateLocation,
  rejectAssignment,
};
