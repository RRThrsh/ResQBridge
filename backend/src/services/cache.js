const { getRedis } = require("../config/redis");

const DEFAULT_TTL = 300;

async function get(key) {
  const redis = await getRedis();
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

async function set(key, value, ttl = DEFAULT_TTL) {
  const redis = await getRedis();
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  } catch {
    /* silently fail */
  }
}

async function del(key) {
  const redis = await getRedis();
  if (!redis) return;
  try {
    await redis.del(key);
  } catch {
    /* silently fail */
  }
}

async function clear(pattern) {
  const redis = await getRedis();
  if (!redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    /* silently fail */
  }
}

function cacheMiddleware(prefix, ttl = DEFAULT_TTL) {
  return async (req, res, next) => {
    if (req.method !== "GET") return next();

    const key = `${prefix}:${req.originalUrl}`;
    const cached = await get(key);
    if (cached) {
      return res.json(cached);
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      set(key, body, ttl);
      originalJson(body);
    };
    next();
  };
}

module.exports = { get, set, del, clear, cacheMiddleware };
