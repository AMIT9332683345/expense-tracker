const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const User = require("../models/user");

// ============================================================
// SMTP CONFIGURATION
// ============================================================

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",

  port: Number(process.env.EMAIL_PORT || 587),

  // Gmail SMTP port 587 = STARTTLS
  secure: String(process.env.EMAIL_SECURE).toLowerCase() === "true",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  // IMPORTANT FOR RENDER:
  // Force IPv4 to avoid IPv6 ENETUNREACH problems.
  family: 4,

  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
});

// ============================================================
// HELPERS
// ============================================================

function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

// ============================================================
// REGISTER
// ============================================================

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// ============================================================
// LOGIN
// ============================================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message:
          "This account does not have a password. Please use Google login.",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// ============================================================
// FORGOT PASSWORD
// SEND OTP TO EMAIL
// ============================================================

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    // Don't reveal whether an email exists.
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If this email is registered, an OTP has been sent.",
      });
    }

    // ========================================================
    // OTP RATE LIMIT
    // ========================================================

    if (
      user.resetOtpExpires &&
      user.resetOtp &&
      user.resetOtpExpires > new Date()
    ) {
      return res.status(429).json({
        success: false,
        message:
          "An OTP has already been sent. Please wait before requesting another.",
      });
    }

    // ========================================================
    // GENERATE OTP
    // ========================================================

    const otp = generateOTP();

    // OTP valid for 10 minutes
    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    user.resetOtp = otp;
    user.resetOtpExpires = expiresAt;
    user.resetOtpAttempts = 0;

    await user.save();

    // ========================================================
    // CHECK SMTP CONNECTION
    // ========================================================

    try {
      await transporter.verify();

      console.log("SMTP CONNECTION VERIFIED");
    } catch (smtpError) {
      console.error("SMTP VERIFY ERROR:", smtpError);

      // Remove OTP if email service is unavailable.
      user.resetOtp = null;
      user.resetOtpExpires = null;
      user.resetOtpAttempts = 0;

      await user.save();

      return res.status(503).json({
        success: false,
        message:
          "Email service is temporarily unavailable. Please try again later.",
      });
    }

    // ========================================================
    // SEND OTP EMAIL
    // ========================================================

    const fromEmail =
      process.env.EMAIL_FROM || process.env.EMAIL_USER;

    await transporter.sendMail({
      from: `"Expense Tracker" <${fromEmail}>`,
      to: normalizedEmail,

      subject: "Expense Tracker - Password Reset OTP",

      text: `
Your Expense Tracker password reset OTP is:

${otp}

This OTP will expire in 10 minutes.

If you did not request a password reset, you can safely ignore this email.
      `.trim(),

      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Password Reset OTP</title>
</head>

<body style="
  margin:0;
  padding:30px;
  background:#f4f4f4;
  font-family:Arial,Helvetica,sans-serif;
">

  <div style="
    max-width:520px;
    margin:auto;
    background:#ffffff;
    border-radius:14px;
    padding:35px;
    box-shadow:0 5px 25px rgba(0,0,0,0.08);
  ">

    <h2 style="
      margin-top:0;
      color:#111827;
    ">
      Expense Tracker
    </h2>

    <h3 style="
      color:#374151;
    ">
      Password Reset
    </h3>

    <p style="
      color:#4b5563;
      font-size:15px;
      line-height:1.6;
    ">
      We received a request to reset your password.
      Use the OTP below to continue.
    </p>

    <div style="
      margin:30px 0;
      padding:20px;
      background:#f3f4f6;
      border-radius:12px;
      text-align:center;
    ">

      <div style="
        color:#6b7280;
        font-size:13px;
        margin-bottom:10px;
      ">
        YOUR OTP
      </div>

      <div style="
        font-size:34px;
        font-weight:bold;
        letter-spacing:8px;
        color:#111827;
      ">
        ${otp}
      </div>

    </div>

    <p style="
      color:#4b5563;
      font-size:14px;
    ">
      This OTP will expire in
      <strong>10 minutes</strong>.
    </p>

    <p style="
      color:#6b7280;
      font-size:13px;
      line-height:1.5;
    ">
      If you did not request this password reset,
      please ignore this email.
    </p>

    <hr style="
      border:none;
      border-top:1px solid #e5e7eb;
      margin:25px 0;
    ">

    <p style="
      color:#9ca3af;
      font-size:12px;
      margin-bottom:0;
    ">
      Expense Tracker
    </p>

  </div>

</body>
</html>
      `,
    });

    console.log(
      `PASSWORD RESET OTP SENT TO: ${normalizedEmail}`
    );

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

// ============================================================
// RESET PASSWORD
// ============================================================

const resetPassword = async (req, res) => {
  try {
    const {
      email,
      otp,
      newPassword,
      password,
    } = req.body;

    const finalPassword = newPassword || password;

    if (!email || !otp || !finalPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Email, OTP and new password are required",
      });
    }

    if (finalPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP or email",
      });
    }

    // ========================================================
    // CHECK OTP EXISTS
    // ========================================================

    if (!user.resetOtp || !user.resetOtpExpires) {
      return res.status(400).json({
        success: false,
        message:
          "OTP is invalid or has expired. Please request a new OTP.",
      });
    }

    // ========================================================
    // CHECK OTP EXPIRATION
    // ========================================================

    if (new Date() > new Date(user.resetOtpExpires)) {
      user.resetOtp = null;
      user.resetOtpExpires = null;
      user.resetOtpAttempts = 0;

      await user.save();

      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new OTP.",
      });
    }

    // ========================================================
    // MAX OTP ATTEMPTS
    // ========================================================

    if (user.resetOtpAttempts >= 5) {
      user.resetOtp = null;
      user.resetOtpExpires = null;
      user.resetOtpAttempts = 0;

      await user.save();

      return res.status(429).json({
        success: false,
        message:
          "Too many incorrect OTP attempts. Please request a new OTP.",
      });
    }

    // ========================================================
    // CHECK OTP
    // ========================================================

    if (String(user.resetOtp) !== String(otp).trim()) {
      user.resetOtpAttempts =
        (user.resetOtpAttempts || 0) + 1;

      await user.save();

      const remaining =
        5 - user.resetOtpAttempts;

      return res.status(400).json({
        success: false,
        message:
          remaining > 0
            ? `Invalid OTP. ${remaining} attempt(s) remaining.`
            : "Too many incorrect OTP attempts. Please request a new OTP.",
      });
    }

    // ========================================================
    // UPDATE PASSWORD
    // ========================================================

    const hashedPassword = await bcrypt.hash(
      finalPassword,
      12
    );

    user.password = hashedPassword;

    // OTP can only be used once.
    user.resetOtp = null;
    user.resetOtpExpires = null;
    user.resetOtpAttempts = 0;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
      error: error.message,
    });
  }
};

// ============================================================
// GOOGLE LOGIN
// ============================================================

const googleLogin = async (req, res) => {
  try {
    const {
      email,
      name,
      googleId,
      picture,
    } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Google email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user = await User.findOne({
      email: normalizedEmail,
    });

    // ========================================================
    // CREATE NEW GOOGLE USER
    // ========================================================

    if (!user) {
      let username =
        normalizedEmail.split("@")[0];

      // Since your schema does not contain username,
      // only save fields that actually exist in User.js.

      user = await User.create({
        name:
          name ||
          normalizedEmail.split("@")[0],

        email: normalizedEmail,

        googleId:
          googleId || undefined,
      });
    }

    // ========================================================
    // UPDATE GOOGLE ID / NAME IF NECESSARY
    // ========================================================

    let changed = false;

    if (googleId && !user.googleId) {
      user.googleId = googleId;
      changed = true;
    }

    if (name && !user.name) {
      user.name = name;
      changed = true;
    }

    if (changed) {
      await user.save();
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("GOOGLE LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Google login failed",
      error: error.message,
    });
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  googleLogin,
};
