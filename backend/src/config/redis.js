const Redis = require("ioredis");

let redis = null;

const REDIS_URL = process.env.REDIS_URL;

if (REDIS_URL) {
  redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) {
        console.warn("Redis: max retries reached. Running without cache.");
        return null;
      }
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  redis.on("error", (err) => {
    console.warn("Redis connection error:", err.message);
  });

  redis.on("ready", () => {
    console.log("Redis connected");
  });
} else {
  console.log("Redis: REDIS_URL not set. Running without cache.");
}

async function getRedis() {
  if (redis && redis.status !== "ready") {
    try {
      await redis.connect();
    } catch {
      return null;
    }
  }
  return redis;
}

module.exports = { getRedis };
