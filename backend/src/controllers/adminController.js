const convexClient = require("../config/convex");
const { anyApi } = require("convex/server");
const { logEvent } = require("../middleware/logAudit");
const { notifyAdmin } = require("../services/adminNotification");

const getUsers = async (_req, res) => {
  const users = await convexClient.query(anyApi.users.getAllUsers);
  const sanitized = users.map((u) => ({
    uuid: u.uuid,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    phoneNumber: u.phoneNumber,
    role: u.role,
  }));
  res.json({ users: sanitized });
};

const getUser = async (req, res) => {
  const user = await convexClient.query(anyApi.users.getUserByUuid, { uuid: req.params.uuid });
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }
  res.json({
    user: {
      uuid: user.uuid,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    },
  });
};

const updateUserRole = async (req, res) => {
  const { uuid } = req.params;
  const { role } = req.body;

  const validRoles = ["superadmin", "admin", "rescuer"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(", ")}` });
  }

  const user = await convexClient.query(anyApi.users.getUserByUuid, { uuid });
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const allUsers = await convexClient.query(anyApi.users.getAllUsers);
  const superadminCount = allUsers.filter((u) => u.role === "superadmin").length;

  if (role === "superadmin") {
    if (superadminCount >= 1 && user.role !== "superadmin") {
      return res.status(400).json({ message: "A superadmin already exists. Only one superadmin is allowed." });
    }
  }

  if (user.role === "superadmin" && role !== "superadmin" && superadminCount <= 1) {
    return res.status(400).json({ message: "Cannot demote the only superadmin. Promote another user first." });
  }

  if (req.user.role !== "superadmin" && uuid === req.user.uuid) {
    return res.status(403).json({ message: "You cannot change your own role." });
  }

  await convexClient.mutation(anyApi.users.updateUserRole, { uuid, role });

  await logEvent({ req, userId: req.user.uuid, eventType: "role_change", metadata: { targetUuid: uuid, oldRole: user.role, newRole: role } });

  res.json({ message: "User role updated successfully." });
};

const STATUS_MAP = {
  pending: "pending",
  accepted: "assigned",
  en_route: "en_route",
  rescue_success: "resolved",
  rescue_failed: "failed",
};

const getAdminReports = async (req, res) => {
  const reports = await convexClient.query(anyApi.reports.listReports);
  const mapped = reports.map((r) => ({
    _id: r._id,
    name: r.reporterEmail || "Anonymous",
    phone: "",
    category: "other",
    animalType: r.animalName,
    urgency: "medium",
    location: r.location,
    description: r.description,
    images: [],
    status: STATUS_MAP[r.status] || r.status,
    assignedTo: r.assignedRescuerEmail || null,
    assignedUser: null,
    latitude: r.latitude ?? null,
    longitude: r.longitude ?? null,
    createdAt: r.createdAt,
  }));
  res.json({ reports: mapped });
};

const assignReport = async (req, res) => {
  res.status(503).json({ message: "Assigning reports requires deploying updated Convex functions. Ask your developer to run: npx convex deploy" });
};

const getRescuerLocations = async (_req, res) => {
  const locations = await convexClient.query(anyApi.locations.getRescuerLocations);
  res.json({ locations });
};

const archiveReport = async (req, res) => {
  res.status(503).json({ message: "Archiving requires deploying updated Convex functions. Ask your developer to run: npx convex deploy" });
};

const unarchiveReport = async (req, res) => {
  res.status(503).json({ message: "Unarchiving requires deploying updated Convex functions. Ask your developer to run: npx convex deploy" });
};

const getArchivedReports = async (_req, res) => {
  res.json({ reports: [] });
};

const deleteReport = async (req, res) => {
  res.status(503).json({ message: "Deleting requires deploying updated Convex functions. Ask your developer to run: npx convex deploy" });
};

const getStats = async (_req, res) => {
  const users = await convexClient.query(anyApi.users.getAllUsers);
  const totalUsers = users.length;
  const roleCounts = { superadmin: 0, admin: 0, rescuer: 0, user: 0 };
  for (const u of users) {
    if (roleCounts[u.role] !== undefined) roleCounts[u.role]++;
  }
  res.json({ stats: { totalUsers, roleCounts } });
};

module.exports = { getUsers, getUser, updateUserRole, getStats, getAdminReports, assignReport, getRescuerLocations, archiveReport, unarchiveReport, getArchivedReports, deleteReport };
