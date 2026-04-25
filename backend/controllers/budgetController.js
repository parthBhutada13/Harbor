const Budget = require("../models/Budget");

// GET /api/budgets
exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id });
    res.json(budgets.map((b) => ({ category: b.category, limit: b.limit })));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch budgets" });
  }
};

// PUT /api/budgets  — upsert a single category/limit pair
exports.upsertBudget = async (req, res) => {
  try {
    const { category, limit } = req.body;
    if (!category || limit == null) {
      return res.status(400).json({ error: "category and limit are required" });
    }

    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, category },
      { limit },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ category: budget.category, limit: budget.limit });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: Object.values(err.errors).map((e) => e.message).join(", ") });
    }
    res.status(500).json({ error: "Failed to upsert budget" });
  }
};

// DELETE /api/budgets/:category
exports.deleteBudget = async (req, res) => {
  try {
    await Budget.findOneAndDelete({ user: req.user._id, category: req.params.category });
    res.json({ message: "Budget removed" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete budget" });
  }
};
