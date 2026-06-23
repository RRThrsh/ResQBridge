const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { asyncHandler } = require("../middleware/errorHandler");
const { getUsers, getUser, updateUserRole, getStats, getAdminReports, assignReport, getRescuerLocations } = require("../controllers/adminController");
const { getLogs, getLogStats, getLogsByIP, deleteOldLogs } = require("../controllers/logController");
const { getDashboardData } = require("../controllers/dashboardController");
const { getConfig, updateConfig, getLandingConfig, updateLandingConfig } = require("../controllers/configController");

router.use(authenticate);

const adminOnly = authorize("superadmin", "admin");
const superOnly = authorize("superadmin");

router.get("/dashboard", superOnly, asyncHandler(getDashboardData));

router.get("/users", adminOnly, asyncHandler(getUsers));
router.get("/users/:uuid", adminOnly, asyncHandler(getUser));
router.get("/stats", adminOnly, asyncHandler(getStats));

const updateRoleRules = [
  body("role").trim().notEmpty().withMessage("Role is required."),
];
router.patch("/users/:uuid/role", adminOnly, updateRoleRules, validate, asyncHandler(updateUserRole));

router.get("/logs", superOnly, asyncHandler(getLogs));
router.get("/logs/stats", superOnly, asyncHandler(getLogStats));
router.get("/logs/ip/:ip", superOnly, asyncHandler(getLogsByIP));
router.post("/logs/cleanup", superOnly, asyncHandler(deleteOldLogs));

router.get("/config", superOnly, asyncHandler(getConfig));
router.put("/config", superOnly, asyncHandler(updateConfig));

router.get("/landing-config", superOnly, asyncHandler(getLandingConfig));
router.put("/landing-config", superOnly, asyncHandler(updateLandingConfig));

router.get("/reports", adminOnly, asyncHandler(getAdminReports));
router.post("/reports/:id/assign", adminOnly, asyncHandler(assignReport));
router.get("/rescuer-locations", adminOnly, asyncHandler(getRescuerLocations));

const { upload, uploadImage } = require("../controllers/uploadController");
router.post("/upload", superOnly, upload.single("image"), asyncHandler(uploadImage));

module.exports = router;
