const convexClient = require("../config/convex");
const { anyApi } = require("convex/server");

const getChecklist = async (req, res) => {
  const checklist = await convexClient.query(anyApi.equipmentChecklists.getChecklist, {
    reportId: req.params.reportId,
  });
  res.json({ checklist });
};

const saveChecklist = async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ message: "Items must be an array." });
  }
  await convexClient.mutation(anyApi.equipmentChecklists.saveChecklist, {
    reportId: req.params.reportId,
    userId: req.user.uuid,
    items,
  });
  res.json({ message: "Checklist saved." });
};

module.exports = { getChecklist, saveChecklist };
