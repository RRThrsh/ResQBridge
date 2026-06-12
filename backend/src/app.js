const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const authRoutes = require("./routes/auth");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.json({ message: "ResQBridge API is running" });
});

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "OK" });
});

app.use("/api/auth", authRoutes);

app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

module.exports = app;
