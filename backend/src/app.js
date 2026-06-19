const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const hpp = require("hpp");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const { globalLimiter, authLimiter } = require("./middleware/rateLimiter");
const { errorHandler } = require("./middleware/errorHandler");

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

app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/admin", adminRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

module.exports = app;
