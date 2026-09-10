const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");

// =========================
// CREATE JWT TOKEN
// =========================
const createToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// =========================
// GOOGLE CLIENT
// =========================
const googleClient = new OAuth2Client();

// =========================
// EMAIL TRANSPORTER
// =========================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// =========================
// REGISTER
// =========================
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword
    });

    const token = createToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during registration."
    });
  }
};

// =========================
// LOGIN
// =========================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google Login. Please continue with Google."
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const token = createToken(user._id);

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login."
    });
  }
};

// =========================
// FORGOT PASSWORD - SEND OTP
// =========================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      return res.json({
        success: true,
        message:
          "If an account exists with this email, an OTP has been sent."
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google Login. Password reset is not available."
      });
    }

    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    user.resetOtp = hashedOtp;
    user.resetOtpExpires =
      Date.now() + 10 * 60 * 1000;
    user.resetOtpAttempts = 0;

    await user.save();

    await transporter.sendMail({
      from:
        process.env.EMAIL_FROM ||
        process.env.EMAIL_USER,
      to: user.email,
      subject: "Expense Tracker - Password Reset OTP",
      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 500px;
          margin: auto;
          padding: 30px;
          border: 1px solid #ddd;
          border-radius: 12px;
        ">
          <h2>Expense Tracker</h2>

          <p>Hello ${user.name},</p>

          <p>
            We received a request to reset your password.
          </p>

          <p>Your OTP is:</p>

          <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            margin: 20px 0;
          ">
            ${otp}
          </div>

          <p>
            This OTP will expire in <b>10 minutes</b>.
          </p>

          <p>
            If you did not request this password reset,
            you can safely ignore this email.
          </p>

          <hr />

          <small>
            Expense Tracker Security Team
          </small>
        </div>
      `
    });

    return res.json({
      success: true,
      message: "OTP sent successfully to your email."
    });

  } catch (error) {
    console.error(
      "FORGOT PASSWORD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to send OTP. Please try again later."
    });
  }
};

// =========================
// RESET PASSWORD USING OTP
// =========================
const resetPassword = async (req, res) => {
  try {
    const {
      email,
      otp,
      password
    } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email, OTP and new password are required."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters."
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP or email."
      });
    }

    if (!user.resetOtp || !user.resetOtpExpires) {
      return res.status(400).json({
        success: false,
        message:
          "No active OTP found. Please request a new OTP."
      });
    }

    if (Date.now() > user.resetOtpExpires) {
      user.resetOtp = null;
      user.resetOtpExpires = null;
      user.resetOtpAttempts = 0;

      await user.save();

      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new OTP."
      });
    }

    if (user.resetOtpAttempts >= 5) {
      return res.status(400).json({
        success: false,
        message:
          "Too many incorrect OTP attempts. Please request a new OTP."
      });
    }

    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp.toString())
      .digest("hex");

    if (hashedOtp !== user.resetOtp) {
      user.resetOtpAttempts =
        (user.resetOtpAttempts || 0) + 1;

      await user.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP."
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    user.resetOtp = null;
    user.resetOtpExpires = null;
    user.resetOtpAttempts = 0;

    await user.save();

    const token = createToken(user._id);

    return res.json({
      success: true,
      message:
        "Password reset successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error(
      "RESET PASSWORD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while resetting password."
    });
  }
};

// =========================
// GOOGLE LOGIN
// =========================
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message:
          "Google credential is required."
      });
    }

    const backendClientId =
      process.env.GOOGLE_CLIENT_ID?.trim();

    if (!backendClientId) {
      return res.status(500).json({
        success: false,
        message:
          "Google Client ID is not configured on the server."
      });
    }

    // ========================================
    // READ GOOGLE TOKEN PAYLOAD FOR DEBUGGING
    // ========================================
    let tokenPayload;

    try {
      const tokenParts = credential.split(".");

      if (tokenParts.length !== 3) {
        throw new Error("Invalid Google ID token format.");
      }

      tokenPayload = JSON.parse(
        Buffer.from(
          tokenParts[1],
          "base64url"
        ).toString("utf8")
      );

      console.log("");
      console.log("========== GOOGLE LOGIN DEBUG ==========");
      console.log(
        "TOKEN AUDIENCE:",
        tokenPayload.aud
      );
      console.log(
        "BACKEND CLIENT ID:",
        backendClientId
      );
      console.log(
        "TOKEN ISSUER:",
        tokenPayload.iss
      );
      console.log(
        "TOKEN EMAIL:",
        tokenPayload.email
      );
      console.log(
        "TOKEN EXPIRY:",
        tokenPayload.exp
      );
      console.log("========================================");
      console.log("");

    } catch (decodeError) {
      console.error(
        "GOOGLE TOKEN DECODE ERROR:",
        decodeError.message
      );

      return res.status(401).json({
        success: false,
        message:
          "Invalid Google credential format."
      });
    }

    // ========================================
    // CHECK AUDIENCE BEFORE GOOGLE LIBRARY
    // ========================================
    if (tokenPayload.aud !== backendClientId) {
      console.error("");
      console.error(
        "❌ GOOGLE CLIENT ID MISMATCH"
      );
      console.error(
        "Token aud:",
        tokenPayload.aud
      );
      console.error(
        "Backend Client ID:",
        backendClientId
      );
      console.error("");

      return res.status(401).json({
        success: false,
        message:
          "Google Client ID mismatch. Frontend and backend are using different Google Client IDs."
      });
    }

    // ========================================
    // VERIFY GOOGLE ID TOKEN
    // ========================================
    const ticket =
      await googleClient.verifyIdToken({
        idToken: credential,
        audience: backendClientId
      });

    const payload =
      ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid Google credential."
      });
    }

    const {
      sub: googleId,
      email,
      name,
      picture,
      email_verified
    } = payload;

    if (!email || !email_verified) {
      return res.status(401).json({
        success: false,
        message:
          "Google email could not be verified."
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    // ========================================
    // FIND EXISTING USER
    // ========================================
    let user = await User.findOne({
      email: normalizedEmail
    });

    if (user) {

      if (!user.googleId) {
        user.googleId = googleId;

        if (!user.name && name) {
          user.name = name;
        }

        await user.save();
      }

    } else {

      // ========================================
      // CREATE NEW GOOGLE ACCOUNT
      // ========================================
      user = await User.create({
        name: name || "Google User",
        email: normalizedEmail,
        password: undefined,
        googleId
      });
    }

    // ========================================
    // CREATE OUR JWT
    // ========================================
    const token = createToken(user._id);

    return res.json({
      success: true,
      message:
        "Google login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: picture || null
      }
    });

  } catch (error) {

    console.error("");
    console.error(
      "❌ GOOGLE LOGIN ERROR:",
      error.message
    );

    console.error(
      "ERROR CODE:",
      error.code || "N/A"
    );

    console.error("");

    return res.status(401).json({
      success: false,
      message:
        "Google authentication failed."
    });
  }
};

// =========================
// EXPORT
// =========================
module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  googleLogin
};