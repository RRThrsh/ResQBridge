const express = require("express");
const authRoutes = require("./routes/auth");

const app = express();

//============================================================
// Middleware
//============================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//============================================================
// Routes
//============================================================
app.use("/api/auth", authRoutes);

//============================================================
// Home Route
//============================================================
app.get("/", (req, res) => {
    res.json({
        message: "Portfolio API is running"
    });
});

//============================================================
// Health Check
//============================================================
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK"
    });
});

//============================================================
// 404 Handler
//============================================================
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

module.exports = app;