const convexClient = require("../config/convex");
const { anyApi } = require("convex/server");

const getShifts = async (req, res) => {
  const shifts = await convexClient.query(anyApi.shifts.getMyShifts, { userId: req.user.uuid });
  res.json({ shifts });
};

const saveShifts = async (req, res) => {
  const { shifts } = req.body;
  if (!Array.isArray(shifts)) {
    return res.status(400).json({ message: "Shifts must be an array." });
  }
  for (const shift of shifts) {
    await convexClient.mutation(anyApi.shifts.upsertShift, {
      userId: req.user.uuid,
      dayOfWeek: shift.dayOfWeek,
      startTime: shift.startTime,
      endTime: shift.endTime,
      active: shift.active,
    });
  }
  res.json({ message: "Shifts saved." });
};

module.exports = { getShifts, saveShifts };
