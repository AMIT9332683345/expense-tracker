const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    // Normal email/password users
    password: {
      type: String,
      required: false
    },

    // Google OAuth
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },

    // Forgot Password OTP
    resetOtp: {
      type: String,
      default: null
    },

    resetOtpExpires: {
      type: Date,
      default: null
    },

    resetOtpAttempts: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);