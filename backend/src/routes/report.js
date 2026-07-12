const express = require("express");
const router = express.Router();
const { submitReport } = require("../controllers/reportController");
const { asyncHandler } = require("../middleware/errorHandler");
const { upload } = require("../controllers/uploadController");
const { honeypot } = require("../middleware/honeypot");
const { csrfCheck } = require("../middleware/csrf");
const { reportLimiter } = require("../middleware/rateLimiter");

router.post("/", reportLimiter, honeypot(), csrfCheck, upload.array("images", 5), honeypot(), asyncHandler(submitReport));

module.exports = router;
