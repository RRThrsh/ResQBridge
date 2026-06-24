const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");
const {
  getReports,
  updateReportStatus,
  getStats,
  updateProfile,
  getActivity,
  updateAvailability,
  addNote,
  getNotes,
  updateLocation,
  rejectAssignment,
  triggerSos,
} = require("../controllers/rescuerController");
const { upload, uploadImage } = require("../controllers/uploadController");

router.use(authenticate);
router.use(authorize("rescuer", "admin", "superadmin"));

router.get("/reports", asyncHandler(getReports));
router.patch("/reports/:id/status", asyncHandler(updateReportStatus));
router.get("/reports/:id/notes", asyncHandler(getNotes));
router.post("/reports/:id/notes", asyncHandler(addNote));
router.get("/stats", asyncHandler(getStats));
router.patch("/profile", asyncHandler(updateProfile));
router.get("/activity", asyncHandler(getActivity));
router.patch("/availability", asyncHandler(updateAvailability));
router.post("/location", asyncHandler(updateLocation));
router.post("/reports/:id/reject", asyncHandler(rejectAssignment));
router.post("/sos", asyncHandler(triggerSos));
router.post("/upload", upload.single("image"), asyncHandler(uploadImage));

module.exports = router;
