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
} = require("../controllers/rescuerController");
const { upload, uploadImage } = require("../controllers/uploadController");
const { getShifts, saveShifts } = require("../controllers/shiftController");
const { sendMessage, getMessages, getConversations } = require("../controllers/messageController");
const { getChecklist, saveChecklist } = require("../controllers/equipmentController");
const { addVoiceNote, getVoiceNotes } = require("../controllers/voiceNoteController");

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
router.post("/upload", upload.single("image"), asyncHandler(uploadImage));

router.get("/shifts", asyncHandler(getShifts));
router.post("/shifts", asyncHandler(saveShifts));
router.post("/messages", asyncHandler(sendMessage));
router.get("/messages", asyncHandler(getMessages));
router.get("/conversations", asyncHandler(getConversations));
router.get("/reports/:reportId/checklist", asyncHandler(getChecklist));
router.post("/reports/:reportId/checklist", asyncHandler(saveChecklist));
router.get("/reports/:reportId/voice-notes", asyncHandler(getVoiceNotes));
router.post("/voice-notes", asyncHandler(addVoiceNote));
router.get("/locations", asyncHandler(async (_req, res) => {
  const convexClient = require("../config/convex");
  const { anyApi } = require("convex/server");
  const locations = await convexClient.query(anyApi.locations.getRescuerLocations);
  res.json({ locations });
}));

module.exports = router;
