const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { authenticate, authorize, authorizeWithPermission } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { asyncHandler } = require("../middleware/errorHandler");
const { getUsers, getUser, updateUserRole, getStats, getAdminReports, assignReport, getRescuerLocations } = require("../controllers/adminController");
const { getLogs, getLogStats, getLogsByIP, deleteOldLogs } = require("../controllers/logController");
const { getDashboardData } = require("../controllers/dashboardController");
const { getConfig, updateConfig, getLandingConfig, updateLandingConfig } = require("../controllers/configController");
const { getAdminPermissions, updateAdminPermissions } = require("../controllers/permissionsController");

router.use(authenticate);

const adminOnly = authorize("superadmin", "admin");
const superOnly = authorize("superadmin");

router.get("/dashboard", authorizeWithPermission("dashboard"), asyncHandler(getDashboardData));

router.get("/users", authorizeWithPermission("users"), asyncHandler(getUsers));
router.get("/users/:uuid", authorizeWithPermission("users"), asyncHandler(getUser));
router.get("/stats", adminOnly, asyncHandler(getStats));

const updateRoleRules = [
  body("role").trim().notEmpty().withMessage("Role is required."),
];
router.patch("/users/:uuid/role", authorizeWithPermission("users", "write"), updateRoleRules, validate, asyncHandler(updateUserRole));

router.get("/logs", authorizeWithPermission("audit"), asyncHandler(getLogs));
router.get("/logs/stats", authorizeWithPermission("audit"), asyncHandler(getLogStats));
router.get("/logs/ip/:ip", authorizeWithPermission("audit"), asyncHandler(getLogsByIP));
router.post("/logs/cleanup", authorizeWithPermission("audit", "execute"), asyncHandler(deleteOldLogs));

router.get("/config", authorizeWithPermission("systemConfig"), asyncHandler(getConfig));
router.put("/config", authorizeWithPermission("systemConfig", "write"), asyncHandler(updateConfig));

router.get("/landing-config", authorizeWithPermission("landingPage"), asyncHandler(getLandingConfig));
router.put("/landing-config", authorizeWithPermission("landingPage", "write"), asyncHandler(updateLandingConfig));

router.get("/permissions", superOnly, asyncHandler(getAdminPermissions));
router.put("/permissions", superOnly, asyncHandler(updateAdminPermissions));

router.get("/reports", authorizeWithPermission("reports"), asyncHandler(getAdminReports));
router.post("/reports/:id/assign", authorizeWithPermission("reports", "execute"), asyncHandler(assignReport));
router.get("/rescuer-locations", authorizeWithPermission("rescuerMap"), asyncHandler(getRescuerLocations));

const { upload, uploadImage } = require("../controllers/uploadController");
router.post("/upload", superOnly, upload.single("image"), asyncHandler(uploadImage));

module.exports = router;
