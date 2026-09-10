import React, { useState } from "react";
import { resetPassword } from "../services/api";
import "./ResetPassword.css";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    // Email validation
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    // OTP validation
    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("OTP must be exactly 6 digits.");
      return;
    }

    // Password validation
    if (!password) {
      setError("Please enter a new password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // Confirm password
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await resetPassword(
        email.trim(),
        otp.trim(),
        password
      );

      if (response.success) {
        setMessage(
          "Password reset successful. Redirecting to login..."
        );

        setEmail("");
        setOtp("");
        setPassword("");
        setConfirmPassword("");

        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        setError(
          response.message ||
            "Unable to reset password."
        );
      }
    } catch (err) {
      console.error(
        "RESET PASSWORD ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    window.location.href = "/";
  };

  return (
    <div className="reset-page">

      {/* Background */}
      <div className="reset-background">
        <div className="reset-circle circle-one"></div>
        <div className="reset-circle circle-two"></div>
        <div className="reset-circle circle-three"></div>
      </div>

      {/* Card */}
      <div className="reset-card">

        {/* Logo */}
        <div className="reset-logo">
          ₹
        </div>

        <h1>Reset Password</h1>

        <p className="reset-subtitle">
          Enter the OTP sent to your email and
          create a new password.
        </p>

        {/* Error */}
        {error && (
          <div className="reset-message error">
            <span>⚠</span>
            {error}
          </div>
        )}

        {/* Success */}
        {message && (
          <div className="reset-message success">
            <span>✓</span>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Email */}
          <div className="reset-input-group">

            <label>Email Address</label>

            <div className="reset-input-wrapper">

              <span className="reset-input-icon">
                ✉
              </span>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                autoComplete="email"
              />

            </div>

          </div>

          {/* OTP */}
          <div className="reset-input-group">

            <label>OTP</label>

            <div className="reset-input-wrapper">

              <span className="reset-input-icon">
                #
              </span>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => {
                  const value =
                    e.target.value.replace(
                      /\D/g,
                      ""
                    );

                  setOtp(value);
                }}
                autoComplete="one-time-code"
              />

            </div>

          </div>

          {/* New Password */}
          <div className="reset-input-group">

            <label>New Password</label>

            <div className="reset-input-wrapper">

              <span className="reset-input-icon">
                🔒
              </span>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter new password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="new-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>

          </div>

          {/* Confirm Password */}
          <div className="reset-input-group">

            <label>Confirm Password</label>

            <div className="reset-input-wrapper">

              <span className="reset-input-icon">
                🔒
              </span>

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                autoComplete="new-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
              >
                {showConfirmPassword
                  ? "Hide"
                  : "Show"}
              </button>

            </div>

          </div>

          {/* Reset Button */}
          <button
            type="submit"
            className="reset-button"
            disabled={loading}
          >
            {loading
              ? "Resetting Password..."
              : "Reset Password"}
          </button>

        </form>

        {/* Back to Login */}
        <button
          type="button"
          className="back-login-button"
          onClick={goToLogin}
        >
          ← Back to Login
        </button>

      </div>
    </div>
  );
}

export default ResetPassword;