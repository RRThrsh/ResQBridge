const convexClient = require("../config/convex");
const { anyApi } = require("convex/server");

const addVoiceNote = async (req, res) => {
  const { reportId, audioUrl, duration } = req.body;
  if (!reportId || !audioUrl) {
    return res.status(400).json({ message: "reportId and audioUrl are required." });
  }
  const userName = `${req.user.firstName} ${req.user.lastName}`;
  await convexClient.mutation(anyApi.voiceNotes.addVoiceNote, {
    reportId,
    userId: req.user.uuid,
    userName,
    audioUrl,
    duration: duration || undefined,
  });
  res.json({ message: "Voice note added." });
};

const getVoiceNotes = async (req, res) => {
  const notes = await convexClient.query(anyApi.voiceNotes.getVoiceNotes, {
    reportId: req.params.reportId,
  });
  res.json({ notes });
};

module.exports = { addVoiceNote, getVoiceNotes };
