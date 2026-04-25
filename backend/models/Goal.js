const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Goal name is required"],
      trim: true,
      maxlength: 100,
    },
    target: {
      type: Number,
      required: [true, "Target amount is required"],
      min: [1, "Target must be at least 1"],
    },
    current: {
      type: Number,
      default: 0,
      min: [0, "Current amount cannot be negative"],
    },
    deadline: { type: String, required: [true, "Deadline is required"] },
    icon: { type: String, default: "🎯", maxlength: 10 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Goal", goalSchema);
