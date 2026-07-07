const jwt = require("jsonwebtoken");
const convexClient = require("../config/convex");
const { anyApi } = require("convex/server");
const { DEFAULT_ADMIN_PERMISSIONS } = require("../controllers/permissionsController");

function authenticate(req, res, next) {
  const token = req.cookies?.token || (req.headers.authorization || "").split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden. Insufficient permissions." });
    }
    next();
  };
}

function authorizeWithPermission(feature, action = "read") {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Access denied." });
    }
    if (req.user.role === "superadmin") return next();
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden. Insufficient permissions." });
    }
    try {
      const raw = await convexClient.query(anyApi.config.getConfigValue, { key: "adminPermissions" });
      let stored = {};
      try { stored = raw ? JSON.parse(raw) : {}; } catch { stored = {}; }
      const permissions = {};
      for (const [feature, defaults] of Object.entries(DEFAULT_ADMIN_PERMISSIONS)) {
        permissions[feature] = { ...defaults, ...(stored[feature] || {}) };
      }
      if (permissions[feature]?.[action] === true) return next();
      return res.status(403).json({ message: "Forbidden. No permission." });
    } catch {
      return res.status(403).json({ message: "Forbidden." });
    }
  };
}

function checkOwnership(getResourceOwnerId) {
  return (req, res, next) => {
    const ownerId = getResourceOwnerId(req);
    if (req.user.uuid !== ownerId) {
      return res.status(403).json({ message: "Forbidden. You do not own this resource." });
    }
    next();
  };
}

module.exports = { authenticate, authorize, authorizeWithPermission, checkOwnership };
