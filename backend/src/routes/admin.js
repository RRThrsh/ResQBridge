const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { asyncHandler } = require("../middleware/errorHandler");
const { getUsers, getUser, updateUserRole, getStats } = require("../controllers/adminController");
const { getLogs, getLogStats, getLogsByIP, deleteOldLogs } = require("../controllers/logController");
const { getConfig, updateConfig, getLandingConfig, updateLandingConfig } = require("../controllers/configController");

router.use(authenticate, authorize("superadmin"));

router.get("/users", asyncHandler(getUsers));
router.get("/users/:uuid", asyncHandler(getUser));
router.get("/stats", asyncHandler(getStats));

const updateRoleRules = [
  body("role").trim().notEmpty().withMessage("Role is required."),
];
router.patch("/users/:uuid/role", updateRoleRules, validate, asyncHandler(updateUserRole));

router.get("/logs", asyncHandler(getLogs));
router.get("/logs/stats", asyncHandler(getLogStats));
router.get("/logs/ip/:ip", asyncHandler(getLogsByIP));
router.post("/logs/cleanup", asyncHandler(deleteOldLogs));

router.get("/config", asyncHandler(getConfig));
router.put("/config", asyncHandler(updateConfig));

router.get("/landing-config", asyncHandler(getLandingConfig));
router.put("/landing-config", asyncHandler(updateLandingConfig));

module.exports = router;
