const rateLimit = require("express-rate-limit");

const store = process.env.REDIS_URL
  ? new (require("rate-limit-redis"))({
      sendCommand: (...args) => {
        const { getRedis } = require("../config/redis");
        return getRedis().then((r) => r?.call(...args));
      },
    })
  : undefined;

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'POST' && req.originalUrl === '/api/v1/rescuer/location',
  message: { message: "Too many requests. Please try again later." },
  ...(store ? { store } : {}),
});

const authLimiter = rateLimit({
  windowMs: 120 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." },
  ...(store ? { store } : {}),
});

module.exports = { globalLimiter, authLimiter };
