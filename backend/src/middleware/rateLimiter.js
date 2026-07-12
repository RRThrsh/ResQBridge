const rateLimit = require("express-rate-limit");

const store = process.env.REDIS_URL
  ? new (require("rate-limit-redis"))({
      sendCommand: (...args) => {
        const { getRedis } = require("../config/redis");
        return getRedis().then((r) => r?.call(...args));
      },
    })
  : undefined;

const storeOptions = store ? { store } : {};

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'POST' && req.originalUrl === '/api/v1/rescuer/location',
  message: { message: "Too many requests. Please try again later." },
  ...storeOptions,
});

const authLimiter = rateLimit({
  windowMs: 120 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." },
  ...storeOptions,
});

const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many OTP requests. Please try again later." },
  ...storeOptions,
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many upload requests. Please try again later." },
  ...storeOptions,
});

const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
  ...storeOptions,
});

const reportLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many report submissions. Please try again later." },
  ...storeOptions,
});

module.exports = { globalLimiter, authLimiter, otpLimiter, uploadLimiter, adminLimiter, reportLimiter };
