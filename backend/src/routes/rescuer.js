const express = require("express");
const { body, param } = require("express-validator");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
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
} = require("../controllers/rescuerController");
const { upload, uploadImage } = require("../controllers/uploadController");
const { getShifts, saveShifts } = require("../controllers/shiftController");
const { getChecklist, saveChecklist } = require("../controllers/equipmentController");
const { addVoiceNote, getVoiceNotes } = require("../controllers/voiceNoteController");

router.use(authenticate);
router.use(authorize("rescuer", "admin", "superadmin"));

const reportIdParam = param("id").trim().notEmpty().withMessage("Report ID is required.");
const reportIdQuery = param("reportId").trim().notEmpty().withMessage("Report ID is required.");

router.get("/reports", asyncHandler(getReports));
router.patch("/reports/:id/status", reportIdParam, validate, asyncHandler(updateReportStatus));
router.get("/reports/:id/notes", reportIdParam, validate, asyncHandler(getNotes));
router.post("/reports/:id/notes", reportIdParam, validate, asyncHandler(addNote));
router.get("/stats", asyncHandler(getStats));
const profileRules = [
  body("firstName").optional().trim().isLength({ max: 50 }).matches(/^[a-zA-Z\s'-]+$/).withMessage("First name contains invalid characters."),
  body("lastName").optional().trim().isLength({ max: 50 }).matches(/^[a-zA-Z\s'-]+$/).withMessage("Last name contains invalid characters."),
  body("phoneNumber").optional().trim().matches(/^\+?\d{7,15}$/).withMessage("Valid phone number is required (7-15 digits)."),
];
router.patch("/profile", profileRules, validate, asyncHandler(updateProfile));
router.get("/activity", asyncHandler(getActivity));
router.patch("/availability", asyncHandler(updateAvailability));
router.post("/location", asyncHandler(updateLocation));
router.post("/reports/:id/reject", reportIdParam, validate, asyncHandler(rejectAssignment));
router.post("/upload", upload.single("image"), asyncHandler(uploadImage));

router.get("/shifts", asyncHandler(getShifts));
router.post("/shifts", asyncHandler(saveShifts));
router.get("/reports/:reportId/checklist", reportIdQuery, validate, asyncHandler(getChecklist));
router.post("/reports/:reportId/checklist", reportIdQuery, validate, asyncHandler(saveChecklist));
router.get("/reports/:reportId/voice-notes", reportIdQuery, validate, asyncHandler(getVoiceNotes));
router.post("/voice-notes", asyncHandler(addVoiceNote));
router.get("/locations", asyncHandler(async (_req, res) => {
  const convexClient = require("../config/convex");
  const { anyApi } = require("convex/server");
  const locations = await convexClient.query(anyApi.locations.getRescuerLocations);
  res.json({ locations });
}));

module.exports = router;
