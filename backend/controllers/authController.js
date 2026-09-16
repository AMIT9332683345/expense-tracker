const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const User = require("../models/user");

// ======================================================
// GOOGLE CLIENT
// ======================================================

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// ======================================================
// TOKEN
// ======================================================

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );
};

// ======================================================
// OTP
// ======================================================

const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// ======================================================
// BREVO SMTP TRANSPORTER
// ======================================================

const createMailTransporter = () => {
  if (!process.env.BREVO_SMTP_HOST) {
    throw new Error("BREVO_SMTP_HOST is missing");
  }

  if (!process.env.BREVO_SMTP_PORT) {
    throw new Error("BREVO_SMTP_PORT is missing");
  }

  if (!process.env.BREVO_SMTP_USER) {
    throw new Error("BREVO_SMTP_USER is missing");
  }

  if (!process.env.BREVO_SMTP_KEY) {
    throw new Error("BREVO_SMTP_KEY is missing");
  }

  return nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST,
    port: Number(process.env.BREVO_SMTP_PORT),
    secure: Number(process.env.BREVO_SMTP_PORT) === 465,

    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_KEY
    },

    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000
  });
};

// ======================================================
// SEND OTP EMAIL
// ======================================================

const sendOtpEmail = async (email, otp, name) => {
  if (!process.env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM is missing");
  }

  const transporter = createMailTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,

    subject: "Your Expense Tracker Password Reset OTP",

    text: `
Hello ${name || "User"},

Your Expense Tracker password reset OTP is:

${otp}

This OTP will expire in 10 minutes.

If you did not request a password reset, please ignore this email.

Expense Tracker
`,

    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset OTP</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#f4f7fb;
  font-family:Arial,Helvetica,sans-serif;
">

  <div style="
    max-width:600px;
    margin:40px auto;
    background:#ffffff;
    border-radius:12px;
    overflow:hidden;
    box-shadow:0 5px 20px rgba(0,0,0,0.08);
  ">

    <div style="
      background:#111827;
      color:white;
      padding:25px;
      text-align:center;
    ">
      <h1 style="margin:0;">
        Expense Tracker
      </h1>
    </div>

    <div style="padding:35px;">

      <h2 style="color:#111827;">
        Password Reset
      </h2>

      <p style="color:#4b5563;">
        Hello ${name || "User"},
      </p>

      <p style="color:#4b5563;">
        We received a request to reset your Expense Tracker
        account password.
      </p>

      <p style="color:#4b5563;">
        Your One-Time Password (OTP) is:
      </p>

      <div style="
        margin:25px 0;
        padding:20px;
        background:#f3f4f6;
        border-radius:10px;
        text-align:center;
      ">

        <span style="
          font-size:36px;
          font-weight:bold;
          letter-spacing:10px;
          color:#111827;
        ">
          ${otp}
        </span>

      </div>

      <p style="color:#6b7280;">
        This OTP will expire in <strong>10 minutes</strong>.
      </p>

      <p style="color:#6b7280;">
        If you did not request a password reset, you can safely
        ignore this email.
      </p>

      <hr style="
        border:none;
        border-top:1px solid #e5e7eb;
        margin:30px 0;
      ">

      <p style="
        color:#9ca3af;
        font-size:12px;
        text-align:center;
      ">
        This is an automated email. Please do not reply.
      </p>

    </div>
  </div>

</body>
</html>
`
  };

  console.log("======================================");
  console.log("BREVO OTP EMAIL");
  console.log("To:", email);
  console.log("From:", process.env.EMAIL_FROM);
  console.log("SMTP HOST:", process.env.BREVO_SMTP_HOST);
  console.log("SMTP PORT:", process.env.BREVO_SMTP_PORT);
  console.log("======================================");

  try {
    const info = await transporter.sendMail(mailOptions);

    console.log("OTP EMAIL SENT SUCCESSFULLY");
    console.log("Message ID:", info.messageId);

    return info;

  } catch (error) {
    console.error("BREVO SMTP ERROR:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);

    throw new Error(
      `Brevo email error: ${error.message}`
    );
  }
};

// ======================================================
// REGISTER
// ======================================================

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long"
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword
    });

    const token = generateToken(user);

    return res.status(201).json({
      message: "Registration successful",

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
      message: "Registration failed",
      error: error.message
    });
  }
};

// ======================================================
// LOGIN
// ======================================================

const login = async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    if (!user.password) {
      return res.status(400).json({
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
        message: "Invalid email or password"
      });
    }

    const token = generateToken(user);

    return res.json({
      message: "Login successful",

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
      message: "Login failed",
      error: error.message
    });
  }
};

// ======================================================
// FORGOT PASSWORD - SEND OTP
// ======================================================

const forgotPassword = async (req, res) => {
  try {
    const {
      email
    } = req.body;

    console.log(
      "FORGOT PASSWORD REQUEST:",
      email
    );

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail
    });

    // Don't reveal whether account exists
    if (!user) {
      return res.json({
        message:
          "If an account exists with this email, an OTP has been sent."
      });
    }

    const otp = generateOtp();

    console.log(
      "OTP GENERATED FOR:",
      normalizedEmail
    );

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    user.resetOtp = otp;
    user.resetOtpExpires = expiresAt;
    user.resetOtpAttempts = 0;

    await user.save();

    try {

      await sendOtpEmail(
        normalizedEmail,
        otp,
        user.name
      );

    } catch (emailError) {

      user.resetOtp = null;
      user.resetOtpExpires = null;
      user.resetOtpAttempts = 0;

      await user.save();

      console.error(
        "OTP EMAIL ERROR:",
        emailError
      );

      return res.status(500).json({
        message: "Unable to send OTP email",
        error: emailError.message
      });
    }

    return res.json({
      message: "OTP sent successfully"
    });

  } catch (error) {

    console.error(
      "FORGOT PASSWORD ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to process password reset",
      error: error.message
    });
  }
};

// ======================================================
// RESET PASSWORD
// ======================================================

const resetPassword = async (req, res) => {
  try {

    const {
      email,
      otp,
      password,
      newPassword
    } = req.body;

    const finalPassword =
      newPassword || password;

    if (
      !email ||
      !otp ||
      !finalPassword
    ) {
      return res.status(400).json({
        message:
          "Email, OTP and new password are required"
      });
    }

    if (finalPassword.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters long"
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
        message: "Invalid OTP or email"
      });
    }

    // Maximum 5 attempts
    if (
      (user.resetOtpAttempts || 0) >= 5
    ) {
      return res.status(429).json({
        message:
          "Too many OTP attempts. Please request a new OTP."
      });
    }

    if (
      !user.resetOtp ||
      !user.resetOtpExpires
    ) {
      return res.status(400).json({
        message:
          "OTP is invalid or has expired. Please request a new OTP."
      });
    }

    // Expired
    if (
      new Date() >
      new Date(user.resetOtpExpires)
    ) {

      user.resetOtp = null;
      user.resetOtpExpires = null;
      user.resetOtpAttempts = 0;

      await user.save();

      return res.status(400).json({
        message:
          "OTP has expired. Please request a new OTP."
      });
    }

    // Increment attempt
    user.resetOtpAttempts =
      (user.resetOtpAttempts || 0) + 1;

    // Verify OTP
    if (
      String(user.resetOtp) !==
      String(otp).trim()
    ) {

      await user.save();

      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        finalPassword,
        10
      );

    user.password = hashedPassword;

    // Clear OTP
    user.resetOtp = null;
    user.resetOtpExpires = null;
    user.resetOtpAttempts = 0;

    await user.save();

    return res.json({
      message:
        "Password reset successful. You can now login."
    });

  } catch (error) {

    console.error(
      "RESET PASSWORD ERROR:",
      error
    );

    return res.status(500).json({
      message: "Password reset failed",
      error: error.message
    });
  }
};

// ======================================================
// GOOGLE LOGIN
// ======================================================

const googleLogin = async (req, res) => {
  try {

    const {
      credential
    } = req.body;

    if (!credential) {
      return res.status(400).json({
        message:
          "Google credential is required"
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        message:
          "GOOGLE_CLIENT_ID is not configured"
      });
    }

    const ticket =
      await googleClient.verifyIdToken({
        idToken: credential,
        audience:
          process.env.GOOGLE_CLIENT_ID
      });

    const payload =
      ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        message:
          "Invalid Google credential"
      });
    }

    const {
      sub: googleId,
      email,
      name
    } = payload;

    if (!email) {
      return res.status(400).json({
        message:
          "Google account email could not be found"
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    let user =
      await User.findOne({
        email: normalizedEmail
      });

    if (!user) {

      user = await User.create({
        name:
          name || "Google User",

        email:
          normalizedEmail,

        googleId,

        password:
          undefined
      });

    } else {

      if (!user.googleId) {

        user.googleId =
          googleId;

        await user.save();
      }
    }

    const token =
      generateToken(user);

    return res.json({
      message:
        "Google login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {

    console.error(
      "GOOGLE LOGIN ERROR:",
      error
    );

    return res.status(401).json({
      message:
        "Google login failed",
      error:
        error.message
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  googleLogin
};
