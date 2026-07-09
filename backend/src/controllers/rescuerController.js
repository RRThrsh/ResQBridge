const convexClient = require("../config/convex");
const { anyApi } = require("convex/server");
const { logEvent } = require("../middleware/logAudit");
const { publish } = require("../services/notification");
const { sendReportStatus } = require("../services/email");
const { notifyAdmin } = require("../services/adminNotification");

const RESCUER_STATUS_MAP = {
  pending: "pending",
  accepted: "assigned",
  en_route: "en_route",
  rescue_success: "resolved",
  rescue_failed: "failed",
};

async function logActivity(userId, action, details, reportId) {
  try {
    await convexClient.mutation(anyApi.activity.insertActivityLog, {
      userId,
      action,
      reportId: reportId || undefined,
      details,
    });
  } catch (err) {
    console.error("[ActivityLog] Failed to insert:", err.message);
  }
}

const getReports = async (req, res) => {
  const { status, assignedTo, search, sortBy } = req.query;
  const user = req.user;

  let reports;
  if (assignedTo && user?.uuid) {
    reports = await convexClient.query(anyApi.reports.getReports, { assignedTo: user.uuid });
  } else {
    reports = await convexClient.query(anyApi.reports.listReports);
  }

  const mapped = reports.map((r) => ({
    _id: r._id,
    name: r.reporterEmail || r.name || "Anonymous",
    phone: r.phone || "",
    category: r.category || "other",
    animalType: r.animalType,
    urgency: r.urgency,
    location: r.location,
    description: r.description,
    images: r.images ? r.images.split(",") : [],
    status: RESCUER_STATUS_MAP[r.status] || r.status,
    assignedTo: r.assignedTo || null,
    latitude: r.latitude ?? null,
    longitude: r.longitude ?? null,
    createdAt: r.createdAt,
  }));

  let filtered = mapped;
  if (status) {
    const mappedStatus = RESCUER_STATUS_MAP[status] || status;
    filtered = filtered.filter((r) => r.status === mappedStatus);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.animalType.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
    );
  }

  if (sortBy === "oldest") {
    filtered.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
  } else {
    filtered.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }

  res.json({ reports: filtered });
};

const rejectAssignment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.uuid;

  await convexClient.mutation(anyApi.reports.rejectAssignment, {
    reportId: id,
  });

  await logActivity(userId, "rejected", "Rejected assignment", id);

  res.json({ message: "Assignment rejected." });
};

const updateLocation = async (req, res) => {
  const userId = req.user.uuid;
  const { latitude, longitude } = req.body;

  if (latitude == null || longitude == null) {
    return res.status(400).json({ message: "Latitude and longitude are required." });
  }

  const user = await convexClient.query(anyApi.users.getUserByUuid, { uuid: userId });
  if (!user) return res.status(404).json({ message: "User not found." });
  const rescuerName = `${user.firstName} ${user.lastName}`.trim();

  await convexClient.mutation(anyApi.locations.updateRescuerLocation, {
    userId: user.uuid,
    userName: rescuerName,
    latitude,
    longitude,
  });

  res.json({ message: "Location updated." });
};

const updateReportStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.uuid;

  if (!status) {
    return res.status(400).json({ message: "Status is required." });
  }

  await convexClient.mutation(anyApi.reports.updateReportStatus, {
    reportId: id,
    status,
  });

  const actionLabels = {
    en_route: "status:en_route",
    in_progress: "status:in_progress",
    resolved: "status:resolved",
    failed: "status:failed",
  };

  await logActivity(userId, actionLabels[status] || status, `Updated report status to ${status.replace('_', ' ')}`, id);

  res.json({ message: "Report status updated." });
};

const getStats = async (req, res) => {
  const userId = req.user.uuid;

  let reports = [];
  let activity = [];
  if (userId) {
    reports = await convexClient.query(anyApi.reports.getReports, { assignedTo: userId });
    activity = await convexClient.query(anyApi.activity.getActivityLogs, {
      userId,
      paginationOpts: { cursor: null, numItems: 200 },
    });
  }

  const total = reports.length;
  const pending = reports.filter((r) => r.status === "pending").length;
  const accepted = reports.filter((r) => r.status === "accepted").length;
  const enRoute = reports.filter((r) => r.status === "en_route").length;
  const resolved = reports.filter((r) => r.status === "rescue_success").length;
  const failed = reports.filter((r) => r.status === "rescue_failed").length;
  const resolvedCount = resolved;
  const failedCount = failed;
  const resolutionRate = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthlyMap = {};
  reports.forEach((r) => {
    if (!r.createdAt) return
    const d = new Date(r.createdAt)
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`
    if (!monthlyMap[key]) monthlyMap[key] = { month: key, assigned: 0, resolved: 0, failed: 0 }
    monthlyMap[key].assigned++
    if (r.status === 'rescue_success') monthlyMap[key].resolved++
    if (r.status === 'rescue_failed') monthlyMap[key].failed++
  });
  const monthlyTrends = Object.values(monthlyMap).sort((a, b) => {
    const da = new Date(a.month)
    const db = new Date(b.month)
    return da - db
  });

  const categoryMap = {};
  reports.forEach((r) => {
    const cat = r.animalName || 'Unknown'
    if (!categoryMap[cat]) categoryMap[cat] = 0
    categoryMap[cat]++
  });
  const categoryBreakdown = Object.entries(categoryMap)
    .map(([animal, count]) => ({ animal, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  let totalResponseTime = 0
  let responseTimeCount = 0
  const activityLogs = activity?.page || []
  for (let i = 0; i < activityLogs.length - 1; i++) {
    if (activityLogs[i].action === 'status:en_route') {
      const assigned = activityLogs.find((a, j) =>
        j > i && a.reportId === activityLogs[i].reportId && a.action !== 'status:en_route'
      )
      if (assigned && activityLogs[i]._creationTime && assigned._creationTime) {
        totalResponseTime += Math.abs(assigned._creationTime - activityLogs[i]._creationTime)
        responseTimeCount++
      }
    }
  }
  const avgResponseTime = responseTimeCount > 0 ? Math.round(totalResponseTime / responseTimeCount / 60000) : null

  const recentReports = reports.slice(0, 10).map((r) => ({
    _id: r._id,
    name: r.reporterEmail || r.name || "Anonymous",
    category: r.category || "other",
    animalType: r.animalType,
    urgency: r.urgency,
    status: RESCUER_STATUS_MAP[r.status] || r.status,
    location: r.location,
    createdAt: r.createdAt,
  }));

  res.json({
    totalAssigned: total,
    activeRequests: pending + accepted + enRoute,
    completed: resolved,
    pending,
    assigned: accepted,
    enRoute,
    inProgress: 0,
    resolved: resolvedCount,
    failed: failedCount,
    resolutionRate,
    avgResponseTime,
    monthlyTrends,
    categoryBreakdown,
    recentReports,
    availability: req.user?.availability || null,
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

  await logActivity(userId, "profile_update", `Updated profile${firstName ? ` (first name: ${firstName})` : ''}${lastName ? ` (last name: ${lastName})` : ''}`);

  const updated = await convexClient.query(anyApi.users.getUserByUuid, { uuid: userId });
  const { password, ...safeUser } = updated;
  res.json({ message: "Profile updated.", user: safeUser });
};

const getActivity = async (req, res) => {
  const userId = req.user.uuid;
  const cursor = req.query.cursor || null;
  const numItems = parseInt(req.query.limit, 10) || 20;
  const result = await convexClient.query(anyApi.activity.getActivityLogs, {
    userId,
    paginationOpts: { cursor, numItems },
  });
  res.json({ activity: result.page, continueCursor: result.continueCursor, isDone: result.isDone });
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

  await logActivity(userId, "availability", `Set status to ${availability}`);

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
