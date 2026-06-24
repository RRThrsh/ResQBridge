const convexClient = require("../config/convex");
const { anyApi } = require("convex/server");
const { logEvent } = require("../middleware/logAudit");

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

const getAdminReports = async (req, res) => {
  const reports = await convexClient.query(anyApi.reports.getAdminReports);
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
    assignedUser: r.assignedUser || null,
    latitude: r.latitude ?? null,
    longitude: r.longitude ?? null,
    createdAt: r.createdAt,
  }));
  res.json({ reports: mapped });
};

const assignReport = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  const adminUuid = req.user.uuid;

  if (!userId) {
    return res.status(400).json({ message: "Rescuer userId is required." });
  }

  await convexClient.mutation(anyApi.reports.assignReport, { reportId: id, userId });

  const rescuer = await convexClient.query(anyApi.users.getUserByUuid, { uuid: userId });
  const rescuerName = rescuer ? `${rescuer.firstName} ${rescuer.lastName}` : userId;

  await convexClient.mutation(anyApi.activity.insertActivityLog, {
    userId,
    action: "assigned",
    reportId: id,
    details: `Assigned to ${rescuerName}`,
  });

  await logEvent({
    req,
    userId: adminUuid,
    eventType: "report_assigned",
    metadata: { reportId: id, assignedTo: userId, rescuerName },
  });

  const { publish } = require("../services/notification");
  await publish({
    type: "report:assigned",
    reportId: id,
    assignedTo: userId,
    assignedByName: rescuerName,
    timestamp: Date.now(),
  });

  res.json({ message: `Report assigned to ${rescuerName}.` });
};

const getRescuerLocations = async (_req, res) => {
  const locations = await convexClient.query(anyApi.locations.getRescuerLocations);
  res.json({ locations });
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

module.exports = { getUsers, getUser, updateUserRole, getStats, getAdminReports, assignReport, getRescuerLocations };
