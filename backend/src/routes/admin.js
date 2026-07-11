const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { authenticate, authorize, authorizeWithPermission } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { asyncHandler } = require("../middleware/errorHandler");
const { getUsers, getUser, updateUserRole, getStats, getAdminReports, assignReport, getRescuerLocations, archiveReport, bulkArchiveReports, unarchiveReport, getArchivedReports, deleteReport } = require("../controllers/adminController");
const { getLogs, getLogStats, getLogsByIP, deleteOldLogs } = require("../controllers/logController");
const { getDashboardData } = require("../controllers/dashboardController");
const { getConfig, updateConfig, getLandingConfig, updateLandingConfig } = require("../controllers/configController");
const { getAdminPermissions, updateAdminPermissions } = require("../controllers/permissionsController");
const { getNotifications, getUnreadCount, markAsRead, markAllAsRead } = require("../controllers/adminNotificationController");
const { exportReports, exportUsers, exportLogs } = require("../controllers/exportController");
const { getHealth } = require("../controllers/healthController");

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

router.get("/permissions", adminOnly, asyncHandler(getAdminPermissions));
router.put("/permissions", superOnly, asyncHandler(updateAdminPermissions));

router.get("/reports", authorizeWithPermission("reports"), asyncHandler(getAdminReports));
router.post("/reports/:id/assign", authorizeWithPermission("reports", "execute"), asyncHandler(assignReport));
router.put("/reports/:id/archive", authorizeWithPermission("reports", "execute"), asyncHandler(archiveReport));
router.post("/reports/bulk/archive", authorizeWithPermission("reports", "execute"), asyncHandler(bulkArchiveReports));
router.get("/reports/archived", authorizeWithPermission("archive"), asyncHandler(getArchivedReports));
router.post("/reports/:id/unarchive", authorizeWithPermission("archive", "write"), asyncHandler(unarchiveReport));
router.delete("/reports/:id", authorizeWithPermission("archive", "execute"), asyncHandler(deleteReport));
router.get("/rescuer-locations", authorizeWithPermission("rescuerMap"), asyncHandler(getRescuerLocations));

router.get("/export/reports", authorizeWithPermission("exportData"), asyncHandler(exportReports));
router.get("/export/users", authorizeWithPermission("exportData"), asyncHandler(exportUsers));
router.get("/export/logs", authorizeWithPermission("exportData"), asyncHandler(exportLogs));

router.get("/health", authorizeWithPermission("systemHealth"), asyncHandler(getHealth));

router.get("/notifications", asyncHandler(getNotifications));
router.get("/notifications/unread-count", asyncHandler(getUnreadCount));
router.patch("/notifications/:id/read", asyncHandler(markAsRead));
router.post("/notifications/read-all", asyncHandler(markAllAsRead));

const { upload, uploadImage } = require("../controllers/uploadController");
router.post("/upload", adminOnly, upload.single("image"), asyncHandler(uploadImage));

module.exports = router;
