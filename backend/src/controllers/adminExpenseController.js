const convexClient = require("../config/convex");
const { anyApi } = require("convex/server");

const getAllExpenses = async (_req, res) => {
  const users = await convexClient.query(anyApi.users.getAllUsers);
  const results = await Promise.all(
    users.map((u) =>
      convexClient.query(anyApi.expenses.getExpenses, { userId: u.uuid })
    )
  );
  const expenses = results.flat().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  res.json({ expenses });
};

const updateExpenseStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!["approved", "reimbursed", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status. Use approved, reimbursed, or rejected." });
  }
  await convexClient.mutation(anyApi.expenses.updateExpenseStatus, { expenseId: id, status });
  res.json({ message: "Expense status updated." });
};

module.exports = { getAllExpenses, updateExpenseStatus };