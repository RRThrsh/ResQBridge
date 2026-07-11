const convexClient = require("../config/convex");
const { anyApi } = require("convex/server");

const addExpense = async (req, res) => {
  const { reportId, category, amount, description, receiptImages } = req.body;
  const userId = req.user.uuid;

  if (!category || amount == null || !description?.trim() || !reportId?.trim()) {
    return res.status(400).json({ message: "Category, amount, description, and linked report are required." });
  }

  await convexClient.mutation(anyApi.expenses.insertExpense, {
    userId,
    reportId,
    category,
    amount: parseFloat(amount),
    description: description.trim(),
    receiptImages: receiptImages?.length ? receiptImages : undefined,
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

const updateExpense = async (req, res) => {
  const { id } = req.params;
  const { amount, description, receiptImages } = req.body;
  await convexClient.mutation(anyApi.expenses.updateExpense, {
    expenseId: id,
    amount: amount !== undefined ? parseFloat(amount) : undefined,
    description: description !== undefined ? description.trim() : undefined,
    receiptImages: receiptImages !== undefined ? receiptImages : undefined,
  });
  res.json({ message: "Expense updated." });
};

const deleteExpense = async (req, res) => {
  const { id } = req.params;
  await convexClient.mutation(anyApi.expenses.deleteExpense, { expenseId: id });
  res.json({ message: "Expense deleted." });
};

module.exports = { addExpense, getExpenses, getExpenseStats, updateExpense, deleteExpense };
