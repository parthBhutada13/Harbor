const mongoose = require("mongoose");

const CATEGORIES = [
  "Food", "Transport", "Academic", "Entertainment",
  "Health", "Shopping", "Utilities",
  "Salary", "Allowance", "Part-time", "Scholarship", "Other",
];

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: [true, "Transaction type is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be positive"],
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: [true, "Category is required"],
    },
    description: { type: String, trim: true, maxlength: 200 },
    date: { type: String, required: [true, "Date is required"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
