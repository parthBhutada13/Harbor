const mongoose = require("mongoose");

const CATEGORIES = [
  "Food", "Transport", "Academic", "Entertainment",
  "Health", "Shopping", "Utilities",
  "Salary", "Allowance", "Part-time", "Scholarship", "Other",
];

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: [true, "Category is required"],
    },
    limit: {
      type: Number,
      required: [true, "Budget limit is required"],
      min: [1, "Limit must be at least 1"],
    },
  },
  { timestamps: true }
);

// One budget per category per user
budgetSchema.index({ user: 1, category: 1 }, { unique: true });

module.exports = mongoose.model("Budget", budgetSchema);
