const express = require("express");
const router  = express.Router();
const { getBudgets, upsertBudget, deleteBudget } = require("../controllers/budgetController");
const protect = require("../middleware/authMiddleware");

router.use(protect);

router.get   ("/",             getBudgets);
router.put   ("/",             upsertBudget);
router.delete("/:category",    deleteBudget);

module.exports = router;
