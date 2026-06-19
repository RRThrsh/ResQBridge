const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");
const { getReports } = require("../controllers/reportController");

router.use(authenticate);
router.use(authorize("rescuer", "admin", "superadmin"));

router.get("/reports", asyncHandler(getReports));

module.exports = router;
