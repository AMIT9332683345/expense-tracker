const express = require("express");

const router = express.Router();

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  googleLogin
} = require("../controllers/authController");

// ========================================
// REGISTER
// ========================================
router.post("/register", register);

// ========================================
// LOGIN
// ========================================
router.post("/login", login);

// ========================================
// FORGOT PASSWORD
// ========================================
router.post("/forgot-password", forgotPassword);

// ========================================
// RESET PASSWORD
// ========================================
router.post("/reset-password", resetPassword);

// ========================================
// GOOGLE LOGIN
// ========================================
router.post("/google", googleLogin);

module.exports = router;