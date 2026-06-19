const express = require("express");
const router = express.Router();
const { submitReport } = require("../controllers/reportController");
const { asyncHandler } = require("../middleware/errorHandler");
const { upload } = require("../controllers/uploadController");

router.post("/", upload.array("images", 5), asyncHandler(submitReport));

module.exports = router;
