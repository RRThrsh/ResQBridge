const convexClient = require("../config/convex");
const { anyApi } = require("convex/server");
const { getRedis } = require("../config/redis");

const getHealth = async (_req, res) => {
  let convexOk = false;
  try {
    await convexClient.query(anyApi.config.getConfigValue, { key: "health_check" });
    convexOk = true;
  } catch {
    convexOk = false;
  }

  let redisOk = false;
  try {
    const redis = await getRedis();
    if (redis) {
      await redis.ping();
      redisOk = true;
    }
  } catch {
    redisOk = false;
  }

  const mem = process.memoryUsage();

  res.json({
    status: convexOk ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    nodeVersion: process.version,
    platform: process.platform,
    memory: {
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024) + "MB",
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024) + "MB",
      rss: Math.round(mem.rss / 1024 / 1024) + "MB",
    },
    services: {
      convex: convexOk ? "connected" : "error",
      redis: redisOk ? "connected" : redisOk === false && getRedis ? "disabled" : "error",
    },
    env: process.env.NODE_ENV || "development",
  });
};

module.exports = { getHealth };
