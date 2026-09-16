const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  getDashboard
} = require("../controllers/dashboardController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard and financial summary APIs
 */

// Dashboard requires login
router.use(authMiddleware);

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", getDashboard);

module.exports = router;