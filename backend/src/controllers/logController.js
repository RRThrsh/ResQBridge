const convexClient = require("../config/convex");
const { anyApi } = require("convex/server");
const { AppError } = require("../middleware/errorHandler");

const getLogs = async (req, res) => {
  const { eventType, ipAddress, limit, cursor } = req.query;

  const result = await convexClient.query(anyApi.logs.getLogs, {
    eventType: eventType || undefined,
    ipAddress: ipAddress || undefined,
    limit: limit ? parseInt(limit, 10) : 200,
    cursor: cursor || undefined,
  });

  res.json(result);
};

const getLogStats = async (_req, res) => {
  const stats = await convexClient.query(anyApi.logs.getLogStats);
  res.json({ stats });
};

const getLogsByIP = async (req, res) => {
  const { ip } = req.params;
  const logs = await convexClient.query(anyApi.logs.getLogsByIP, { ipAddress: ip });
  res.json({ logs });
};

const deleteOldLogs = async (req, res) => {
  const { retentionDays } = req.body;
  if (!retentionDays || retentionDays < 1) {
    throw new AppError("retentionDays must be a positive number.", 400);
  }

  const result = await convexClient.mutation(anyApi.logs.deleteOldLogs, {
    retentionDays: parseInt(retentionDays, 10),
  });

  res.json({ message: `Deleted ${result.deleted} logs older than ${retentionDays} days.` });
};

module.exports = { getLogs, getLogStats, getLogsByIP, deleteOldLogs };
