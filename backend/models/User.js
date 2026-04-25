const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // never return password by default
    },
    settings: {
      darkMode: { type: Boolean, default: true },
      accentColor: { type: String, default: "harbor", enum: ["harbor", "crimson", "forest"] },
      density: { type: String, default: "comfortable", enum: ["comfortable", "compact"] },
      currency: {
        code:   { type: String, default: "USD" },
        symbol: { type: String, default: "$" },
        name:   { type: String, default: "US Dollar" },
      },
      dateFormat:   { type: String, default: "MM/DD/YYYY" },
      numberFormat: { type: String, default: "1,000.00" },
      notifications: {
        weeklySummary:     { type: Boolean, default: true },
        largeTxAlerts:     { type: Boolean, default: true },
        largeTxThreshold:  { type: Number,  default: 500 },
        budgetWarnings:    { type: Boolean, default: true },
      },
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare candidate password with stored hash
userSchema.methods.matchPassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
