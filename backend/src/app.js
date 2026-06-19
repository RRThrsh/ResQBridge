const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const hpp = require("hpp");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const { globalLimiter, authLimiter } = require("./middleware/rateLimiter");
const { errorHandler, asyncHandler } = require("./middleware/errorHandler");
const { logEvent } = require("./middleware/logAudit");

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(cors());
app.use(globalLimiter);
app.use(hpp());
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

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
  const authHeader = req.headers.authorization;
  let userId = null;
  if (authHeader) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = require("jsonwebtoken").verify(token, process.env.JWT_SECRET);
      userId = decoded.uuid;
    } catch {}
  }
  await logEvent({ req, userId, eventType: "logout" });
  res.json({ message: "Logged." });
});

app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/admin", adminRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

module.exports = app;
