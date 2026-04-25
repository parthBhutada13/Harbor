const Transaction = require("../models/Transaction");

// GET /api/transactions
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });
    // Return shape the frontend expects: { id, type, amount, category, description, date }
    const mapped = transactions.map((t) => ({
      id:          t._id.toString(),
      type:        t.type,
      amount:      t.amount,
      category:    t.category,
      description: t.description || "",
      date:        t.date,
    }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

// POST /api/transactions
exports.createTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;

    if (!type || !amount || !category || !date) {
      return res.status(400).json({ error: "type, amount, category, and date are required" });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      amount,
      category,
      description,
      date,
    });

    res.status(201).json({
      id:          transaction._id.toString(),
      type:        transaction.type,
      amount:      transaction.amount,
      category:    transaction.category,
      description: transaction.description || "",
      date:        transaction.date,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: Object.values(err.errors).map((e) => e.message).join(", ") });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to create transaction" });
  }
};

// PUT /api/transactions/:id
exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!transaction) return res.status(404).json({ error: "Transaction not found" });

    const { type, amount, category, description, date } = req.body;
    if (type)        transaction.type        = type;
    if (amount)      transaction.amount      = amount;
    if (category)    transaction.category    = category;
    if (description !== undefined) transaction.description = description;
    if (date)        transaction.date        = date;

    await transaction.save();
    res.json({
      id:          transaction._id.toString(),
      type:        transaction.type,
      amount:      transaction.amount,
      category:    transaction.category,
      description: transaction.description || "",
      date:        transaction.date,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update transaction" });
  }
};

// DELETE /api/transactions/:id
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!transaction) return res.status(404).json({ error: "Transaction not found" });
    res.json({ message: "Transaction deleted", id: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete transaction" });
  }
};
