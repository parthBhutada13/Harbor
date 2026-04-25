const jwt = require("jsonwebtoken");
const User = require("../models/User");

/** Generate a signed JWT for a given user id */
function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "username, email, and password are all required" });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) return res.status(409).json({ error: "Email already in use" });

    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(409).json({ error: "Username already taken" });

    const user = await User.create({ username, email, password });
    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: {
        id:       user._id,
        username: user.username,
        email:    user.email,
        settings: user.settings,
      },
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(", ") });
    }
    console.error("register error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const match = await user.matchPassword(password);
    if (!match) return res.status(401).json({ error: "Invalid email or password" });

    const token = signToken(user._id);

    res.json({
      token,
      user: {
        id:       user._id,
        username: user.username,
        email:    user.email,
        settings: user.settings,
      },
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
};

// GET /api/auth/me  (protected)
exports.getMe = async (req, res) => {
  try {
    const user = req.user; // set by authMiddleware
    res.json({
      id:       user._id,
      username: user.username,
      email:    user.email,
      settings: user.settings,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// PUT /api/auth/profile  (protected)
exports.updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.user._id);

    if (username) user.username = username;
    if (email)    user.email    = email.toLowerCase();

    await user.save();
    res.json({ id: user._id, username: user.username, email: user.email, settings: user.settings });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: "Username or email already taken" });
    res.status(500).json({ error: "Server error" });
  }
};

// PUT /api/auth/settings  (protected)
exports.updateSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    // Deep merge the settings
    user.settings = { ...user.settings.toObject(), ...req.body };
    await user.save();
    res.json({ settings: user.settings });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
