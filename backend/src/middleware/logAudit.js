const convexClient = require("../config/convex");
const { anyApi } = require("convex/server");

function getClientIP(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || "0.0.0.0";
}

async function logEvent({ req, userId, eventType, section, metadata, sessionDuration }) {
  try {
    await convexClient.mutation(anyApi.logs.insertLog, {
      userId: userId || undefined,
      eventType,
      section: section || undefined,
      ipAddress: getClientIP(req),
      userAgent: req?.headers?.["user-agent"] || undefined,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
      sessionDuration: sessionDuration || undefined,
    });
  } catch (err) {
    console.error("[AuditLog] Failed to insert log:", err.message);
  }
}

function auditMiddleware(eventType) {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      const userId = req.user?.uuid;
      logEvent({ req, userId, eventType, metadata: { path: req.originalUrl, method: req.method, status: res.statusCode, response: body } });
      return originalJson(body);
    };
    next();
  };
}

module.exports = { logEvent, auditMiddleware, getClientIP };
