const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction
} = require("../controllers/transactionController");

const router = express.Router();

// All transaction routes require login
router.use(authMiddleware);

// Create
router.post("/", createTransaction);

// Get all
router.get("/", getTransactions);

// Get single
router.get("/:id", getTransaction);

// Update
router.put("/:id", updateTransaction);

// Delete
router.delete("/:id", deleteTransaction);

module.exports = router;