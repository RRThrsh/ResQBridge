const convexClient = require("../config/convex");
const { anyApi } = require("convex/server");

const addExpense = async (req, res) => {
  const { reportId, category, amount, description, receiptUrl } = req.body;
  const userId = req.user.uuid;

  if (!category || amount == null || !description?.trim()) {
    return res.status(400).json({ message: "Category, amount, and description are required." });
  }

  await convexClient.mutation(anyApi.expenses.insertExpense, {
    userId,
    reportId: reportId || undefined,
    category,
    amount: parseFloat(amount),
    description: description.trim(),
    receiptUrl: receiptUrl || undefined,
  });

  res.json({ message: "Expense logged." });
};

const getExpenses = async (req, res) => {
  const userId = req.user.uuid;
  const expenses = await convexClient.query(anyApi.expenses.getExpenses, { userId });
  res.json({ expenses });
};

const getExpenseStats = async (req, res) => {
  const userId = req.user.uuid;
  const stats = await convexClient.query(anyApi.expenses.getExpenseStats, { userId });
  res.json(stats);
};

module.exports = { addExpense, getExpenses, getExpenseStats };
