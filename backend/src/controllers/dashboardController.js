const convexClient = require("../config/convex");
const { anyApi } = require("convex/server");

const getDashboardData = async (_req, res) => {
  const data = await convexClient.query(anyApi.logs.getDashboardData);
  res.json(data);
};

module.exports = { getDashboardData };
