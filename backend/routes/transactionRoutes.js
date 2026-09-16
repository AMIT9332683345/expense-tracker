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

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Transaction management APIs
 */

// All transaction routes require login
router.use(authMiddleware);

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 500
 *               type:
 *                 type: string
 *                 example: expense
 *               category:
 *                 type: string
 *                 example: Food
 *               description:
 *                 type: string
 *                 example: Lunch
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2026-09-16
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       400:
 *         description: Invalid transaction data
 *       401:
 *         description: Unauthorized
 */
router.post("/", createTransaction);

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", getTransactions);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Get a single transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found
 */
router.get("/:id", getTransaction);

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Update a transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 750
 *               type:
 *                 type: string
 *                 example: expense
 *               category:
 *                 type: string
 *                 example: Food
 *               description:
 *                 type: string
 *                 example: Dinner
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2026-09-16
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *       400:
 *         description: Invalid transaction data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found
 */
router.put("/:id", updateTransaction);

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Delete a transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found
 */
router.delete("/:id", deleteTransaction);

module.exports = router;