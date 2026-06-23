const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const reportRoutes = require("./routes/report");
const rescuerRoutes = require("./routes/rescuer");
const { globalLimiter, authLimiter } = require("./middleware/rateLimiter");
const { errorHandler, asyncHandler } = require("./middleware/errorHandler");
const { logEvent } = require("./middleware/logAudit");
const { authenticate } = require("./middleware/auth");
const convexClient = require("./config/convex");
const { anyApi } = require("convex/server");
const { addSSEClient } = require("./services/notification");

const app = express();

app.set("trust proxy", 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://maps.googleapis.com", "https://maps.gstatic.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:", "https://maps.gstatic.com", "https://maps.googleapis.com"],
      connectSrc: ["'self'", "https://maps.googleapis.com"],
      frameSrc: ["'self'", "https://www.openstreetmap.org"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(cookieParser());
app.use(globalLimiter);
app.use(hpp());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static("uploads"));

app.get("/api/v1", (_req, res) => {
  res.json({ message: "ResQBridge API is running" });
});

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({ status: "OK" });
});

const { getLandingConfig: publicLandingConfig } = require("./controllers/configController");

app.get("/api/v1/landing-config", asyncHandler(publicLandingConfig));

app.post("/api/v1/log/guest", async (req, res) => {
  const { section, duration, eventType } = req.body;
  try {
    await logEvent({
      req,
      eventType: eventType || "guest",
      section: section || "unknown",
      sessionDuration: duration || null,
    });
    res.json({ message: "Logged." });
  } catch { res.status(200).json({ message: "OK" }); }
});

app.post("/api/v1/log/logout", async (req, res) => {
  const token = req.cookies.token || (req.headers.authorization || "").split(" ")[1];
  let userId = null;
  if (token) {
    try { userId = jwt.verify(token, process.env.JWT_SECRET).uuid; } catch {}
  }
  res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/" });
  await logEvent({ req, userId, eventType: "logout" });
  res.json({ message: "Logged." });
});

app.get("/api/v1/auth/me", authenticate, asyncHandler(async (req, res) => {
  const user = await convexClient.query(anyApi.users.getUserByUuid, { uuid: req.user.uuid });
  if (!user) {
    res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/" });
    return res.status(401).json({ message: "User not found." });
  }
  const { password, ...safeUser } = user;
  res.json({ user: safeUser });
}));

app.get("/api/v1/report/updates", authenticate, (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);
  addSSEClient(res);
});

app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/report", reportRoutes);
app.use("/api/v1/rescuer", rescuerRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

module.exports = app;
