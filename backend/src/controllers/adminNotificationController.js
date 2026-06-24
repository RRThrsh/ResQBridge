const convexClient = require("../config/convex");
const { anyApi } = require("convex/server");

const getNotifications = async (req, res) => {
  const { limit } = req.query;
  const notifications = await convexClient.query(anyApi.adminNotifications.getNotifications, {
    limit: limit ? parseInt(limit, 10) : 20,
  });
  res.json({ notifications });
};

const getUnreadCount = async (_req, res) => {
  const count = await convexClient.query(anyApi.adminNotifications.getUnreadCount);
  res.json({ count });
};

const markAsRead = async (req, res) => {
  const { id } = req.params;
  await convexClient.mutation(anyApi.adminNotifications.markAsRead, { id });
  res.json({ message: "Marked as read." });
};

const markAllAsRead = async (_req, res) => {
  await convexClient.mutation(anyApi.adminNotifications.markAllAsRead);
  res.json({ message: "All notifications marked as read." });
};

module.exports = { getNotifications, getUnreadCount, markAsRead, markAllAsRead };
