const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");
const https = require("https");

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
      // IMPORTANT:
      // authMiddleware expects decoded.userId
      userId: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
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
// BREVO API EMAIL
// ======================================================

const sendBrevoEmail = (email, otp, name) => {
  return new Promise((resolve, reject) => {
    if (!process.env.BREVO_API_KEY) {
      return reject(
        new Error("BREVO_API_KEY is missing")
      );
    }

    if (!process.env.EMAIL_FROM) {
      return reject(
        new Error("EMAIL_FROM is missing")
      );
    }

    const senderName =
      process.env.EMAIL_FROM_NAME ||
      "Expense Tracker";

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
    border-radius:14px;
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
        We received a request to reset your
        Expense Tracker password.
      </p>

      <p style="color:#4b5563;">
        Your OTP is:
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
        This OTP will expire in
        <strong>10 minutes</strong>.
      </p>

      <p style="color:#6b7280;">
        If you did not request a password reset,
        you can safely ignore this email.
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
        This is an automated email.
        Please do not reply.
      </p>

    </div>
  </div>

</body>
</html>
`;

    const postData = JSON.stringify({
      sender: {
        name: senderName,
        email: process.env.EMAIL_FROM,
      },

      to: [
        {
          email: email,
          name: name || "User",
        },
      ],

      subject:
        "Your Expense Tracker Password Reset OTP",

      htmlContent: html,

      textContent: `
Hello ${name || "User"},

Your Expense Tracker password reset OTP is:

${otp}

This OTP will expire in 10 minutes.

If you did not request a password reset,
please ignore this email.

Expense Tracker
`,
    });

    const options = {
      hostname: "api.brevo.com",
      path: "/v3/smtp/email",
      method: "POST",

      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
        "content-length": Buffer.byteLength(
          postData
        ),
      },

      timeout: 30000,
    };

    const request = https.request(
      options,
      (response) => {
        let body = "";

        response.on("data", (chunk) => {
          body += chunk;
        });

        response.on("end", () => {
          let data;

          try {
            data = JSON.parse(body);
          } catch {
            data = body;
          }

          if (
            response.statusCode >= 200 &&
            response.statusCode < 300
          ) {
            console.log(
              "BREVO API EMAIL SENT SUCCESSFULLY"
            );

            console.log(
              "Message ID:",
              data?.messageId
            );

            resolve(data);
          } else {
            console.error(
              "BREVO API ERROR"
            );

            console.error(
              "Status:",
              response.statusCode
            );

            console.error(
              "Response:",
              data
            );

            reject(
              new Error(
                data?.message ||
                "Brevo email sending failed"
              )
            );
          }
        });
      }
    );

    request.on("timeout", () => {
      request.destroy();

      reject(
        new Error(
          "Brevo API connection timeout"
        )
      );
    });

    request.on("error", (error) => {
      reject(error);
    });

    request.write(postData);

    request.end();
  });
};

// ======================================================
// REGISTER
// ======================================================

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    if (
      !name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters long",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "User already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const user =
      await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
      });

    const token =
      generateToken(user);

    return res.status(201).json({
      success: true,
      message:
        "Registration successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error(
      "REGISTER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Registration failed",
      error: error.message,
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
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user =
      await User.findOne({
        email: normalizedEmail,
      });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google Login. Please continue with Google.",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    const token =
      generateToken(user);

    return res.json({
      success: true,
      message:
        "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error(
      "LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Login failed",
      error: error.message,
    });
  }
};

// ======================================================
// FORGOT PASSWORD - SEND OTP
// ======================================================

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    console.log(
      "FORGOT PASSWORD REQUEST:",
      email
    );

    if (!email) {
      return res.status(400).json({
        success: false,
        message:
          "Email is required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user =
      await User.findOne({
        email: normalizedEmail,
      });

    // Don't reveal whether account exists
    if (!user) {
      return res.json({
        success: true,
        message:
          "If an account exists with this email, an OTP has been sent.",
      });
    }

    const otp =
      generateOtp();

    console.log(
      "OTP GENERATED FOR:",
      normalizedEmail
    );

    const expiresAt =
      new Date(
        Date.now() +
        10 * 60 * 1000
      );

    user.resetOtp = otp;

    user.resetOtpExpires =
      expiresAt;

    user.resetOtpAttempts = 0;

    await user.save();

    try {
      console.log(
        "======================================"
      );

      console.log(
        "BREVO API OTP EMAIL"
      );

      console.log(
        "To:",
        normalizedEmail
      );

      console.log(
        "From:",
        process.env.EMAIL_FROM
      );

      console.log(
        "======================================"
      );

      await sendBrevoEmail(
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
        success: false,
        message:
          "Unable to send OTP email",
        error:
          emailError.message,
      });
    }

    return res.json({
      success: true,
      message:
        "OTP sent successfully",
    });

  } catch (error) {
    console.error(
      "FORGOT PASSWORD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to process password reset",
      error:
        error.message,
    });
  }
};

// ======================================================
// RESET PASSWORD
// ======================================================

const resetPassword = async (
  req,
  res
) => {
  try {

    const {
      email,
      otp,
      password,
      newPassword,
    } = req.body;

    const finalPassword =
      newPassword || password;

    if (
      !email ||
      !otp ||
      !finalPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email, OTP and new password are required",
      });
    }

    if (
      finalPassword.length < 6
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters long",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user =
      await User.findOne({
        email: normalizedEmail,
      });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid OTP or email",
      });
    }

    if (
      (user.resetOtpAttempts || 0) >= 5
    ) {
      return res.status(429).json({
        success: false,
        message:
          "Too many OTP attempts. Please request a new OTP.",
      });
    }

    if (
      !user.resetOtp ||
      !user.resetOtpExpires
    ) {
      return res.status(400).json({
        success: false,
        message:
          "OTP is invalid or has expired. Please request a new OTP.",
      });
    }

    if (
      new Date() >
      new Date(
        user.resetOtpExpires
      )
    ) {

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

    user.resetOtpAttempts =
      (user.resetOtpAttempts || 0) + 1;

    if (
      String(user.resetOtp) !==
      String(otp).trim()
    ) {

      await user.save();

      return res.status(400).json({
        success: false,
        message:
          "Invalid OTP",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        finalPassword,
        10
      );

    user.password =
      hashedPassword;

    user.resetOtp = null;

    user.resetOtpExpires = null;

    user.resetOtpAttempts = 0;

    await user.save();

    // Automatically login after reset
    const token =
      generateToken(user);

    return res.json({
      success: true,

      message:
        "Password reset successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {

    console.error(
      "RESET PASSWORD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Password reset failed",
      error:
        error.message,
    });
  }
};

// ======================================================
// GOOGLE LOGIN
// ======================================================

const googleLogin = async (
  req,
  res
) => {
  try {

    const {
      credential,
    } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message:
          "Google credential is required",
      });
    }

    if (
      !process.env.GOOGLE_CLIENT_ID
    ) {
      return res.status(500).json({
        success: false,
        message:
          "GOOGLE_CLIENT_ID is not configured",
      });
    }

    const ticket =
      await googleClient.verifyIdToken({
        idToken: credential,

        audience:
          process.env.GOOGLE_CLIENT_ID,
      });

    const payload =
      ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid Google credential",
      });
    }

    const {
      sub: googleId,
      email,
      name,
    } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message:
          "Google account email could not be found",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    let user =
      await User.findOne({
        email: normalizedEmail,
      });

    if (!user) {

      user =
        await User.create({
          name:
            name || "Google User",

          email:
            normalizedEmail,

          googleId,

          password:
            undefined,
        });

    } else {

      if (
        !user.googleId
      ) {

        user.googleId =
          googleId;

        await user.save();
      }
    }

    const token =
      generateToken(user);

    // IMPORTANT:
    // Return success directly.
    // Frontend should immediately login
    // without showing another popup/message.

    return res.json({
      success: true,

      message:
        "Google login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {

    console.error(
      "GOOGLE LOGIN ERROR:",
      error
    );

    return res.status(401).json({
      success: false,
      message:
        "Google login failed",
      error:
        error.message,
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
  googleLogin,
};