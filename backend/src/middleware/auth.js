const jwt = require("jsonwebtoken");

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

function checkOwnership(getResourceOwnerId) {
  return (req, res, next) => {
    const ownerId = getResourceOwnerId(req);
    if (req.user.uuid !== ownerId) {
      return res.status(403).json({ message: "Forbidden. You do not own this resource." });
    }
    next();
  };
}

module.exports = { authenticate, authorize, checkOwnership };
