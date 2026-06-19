const convexClient = require("../config/convex");
const { anyApi } = require("convex/server");

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

  const validRoles = ["superadmin", "admin", "rescuer", "user"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(", ")}` });
  }

  const user = await convexClient.query(anyApi.users.getUserByUuid, { uuid });
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  if (role === "superadmin") {
    const allUsers = await convexClient.query(anyApi.users.getAllUsers);
    const superadminCount = allUsers.filter((u) => u.role === "superadmin").length;

    if (superadminCount >= 1 && user.role !== "superadmin") {
      return res.status(400).json({ message: "A superadmin already exists. Only one superadmin is allowed." });
    }
  }

  if (req.user.role !== "superadmin" && uuid === req.user.uuid) {
    return res.status(403).json({ message: "You cannot change your own role." });
  }

  await convexClient.mutation(anyApi.users.updateUserRole, { uuid, role });

  res.json({ message: "User role updated successfully." });
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

module.exports = { getUsers, getUser, updateUserRole, getStats };
