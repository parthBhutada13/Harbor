const Goal = require("../models/Goal");

// GET /api/goals
exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(goals.map((g) => ({
      id:       g._id.toString(),
      name:     g.name,
      target:   g.target,
      current:  g.current,
      deadline: g.deadline,
      icon:     g.icon,
    })));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch goals" });
  }
};

// POST /api/goals
exports.createGoal = async (req, res) => {
  try {
    const { name, target, current, deadline, icon } = req.body;
    if (!name || !target || !deadline) {
      return res.status(400).json({ error: "name, target, and deadline are required" });
    }

    const goal = await Goal.create({ user: req.user._id, name, target, current: current || 0, deadline, icon });
    res.status(201).json({
      id: goal._id.toString(), name: goal.name, target: goal.target,
      current: goal.current, deadline: goal.deadline, icon: goal.icon,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: Object.values(err.errors).map((e) => e.message).join(", ") });
    }
    res.status(500).json({ error: "Failed to create goal" });
  }
};

// PUT /api/goals/:id
exports.updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ error: "Goal not found" });

    const { name, target, current, deadline, icon } = req.body;
    if (name     !== undefined) goal.name     = name;
    if (target   !== undefined) goal.target   = target;
    if (current  !== undefined) goal.current  = current;
    if (deadline !== undefined) goal.deadline = deadline;
    if (icon     !== undefined) goal.icon     = icon;

    await goal.save();
    res.json({
      id: goal._id.toString(), name: goal.name, target: goal.target,
      current: goal.current, deadline: goal.deadline, icon: goal.icon,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update goal" });
  }
};

// DELETE /api/goals/:id
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ error: "Goal not found" });
    res.json({ message: "Goal deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete goal" });
  }
};
