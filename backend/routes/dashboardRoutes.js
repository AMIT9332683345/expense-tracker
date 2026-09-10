const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  getDashboard
} = require("../controllers/dashboardController");

const router = express.Router();

// Dashboard requires login
router.use(authMiddleware);

// GET dashboard
router.get("/", getDashboard);

module.exports = router;