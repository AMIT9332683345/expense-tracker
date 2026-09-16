import React, { useState } from "react";
import { resetPassword } from "../services/api";
import "./ResetPassword.css";

function ResetPassword() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ======================================================
  // SEND OTP
  // ======================================================

  const sendOtp = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL ||
          process.env.VITE_API_URL ||
          "http://localhost:5000"
        }/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: email.trim()
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to send OTP."
        );
      }

      setMessage(
        "OTP sent successfully. Please check your email."
      );

      // Go to OTP step automatically
      setStep(2);

    } catch (err) {
      console.error("SEND OTP ERROR:", err);

      setError(
        err.message ||
          "Unable to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // VERIFY OTP - MOVE TO PASSWORD STEP
  // ======================================================

  const verifyOtp = (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("OTP must be exactly 6 digits.");
      return;
    }

    setStep(3);
  };

  // ======================================================
  // RESET PASSWORD
  // ======================================================

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!password) {
      setError("Please enter a new password.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your new password.");
      return;
    }

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

      if (!response || response.success === false) {
        throw new Error(
          response?.message ||
            "Unable to reset password."
        );
      }

      setMessage(
        "Password reset successful. Redirecting to login..."
      );

      setEmail("");
      setOtp("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        window.location.href = "/";
      }, 1800);

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

  // ======================================================
  // BACK TO LOGIN
  // ======================================================

  const goToLogin = () => {
    window.location.href = "/";
  };

  // ======================================================
  // BACK STEP
  // ======================================================

  const goBack = () => {
    setError("");
    setMessage("");

    if (step === 3) {
      setStep(2);
      return;
    }

    if (step === 2) {
      setStep(1);
    }
  };

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="reset-page">

      {/* Background */}
      <div className="reset-background">

        <div className="reset-orb reset-orb-one"></div>

        <div className="reset-orb reset-orb-two"></div>

        <div className="reset-grid"></div>

      </div>

      {/* Card */}
      <div className="reset-card">

        {/* Logo */}
        <div className="reset-logo">
          ₹
        </div>

        {/* ==================================================
            STEP 1 - EMAIL
        ================================================== */}

        {step === 1 && (
          <>
            <div className="reset-heading">

              <div className="reset-label">
                PASSWORD RECOVERY
              </div>

              <h1>Forgot Password?</h1>

              <p>
                Enter your email address and we'll
                send you a verification OTP.
              </p>

            </div>

            {/* Error */}
            {error && (
              <div className="reset-error">
                <span>!</span>
                <p>{error}</p>
              </div>
            )}

            {/* Success */}
            {message && (
              <div className="reset-message success">
                <span>✓</span>
                {message}
              </div>
            )}

            <form
              className="reset-form"
              onSubmit={sendOtp}
            >

              <div className="reset-input-group">

                <label>
                  Email Address
                </label>

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
                    disabled={loading}
                  />

                </div>

              </div>

              <button
                type="submit"
                className="reset-submit"
                disabled={loading}
              >
                <span>
                  {loading
                    ? "Sending OTP..."
                    : "Send OTP"}
                </span>

                <span>
                  →
                </span>
              </button>

            </form>

            <button
              type="button"
              className="reset-back-login"
              onClick={goToLogin}
            >
              ← Back to Login
            </button>
          </>
        )}

        {/* ==================================================
            STEP 2 - OTP
        ================================================== */}

        {step === 2 && (
          <>
            <div className="reset-heading">

              <div className="reset-label">
                VERIFICATION
              </div>

              <h1>Enter OTP</h1>

              <p>
                We've sent a 6-digit verification
                code to <strong>{email}</strong>.
              </p>

            </div>

            {/* Error */}
            {error && (
              <div className="reset-error">
                <span>!</span>
                <p>{error}</p>
              </div>
            )}

            {/* Success */}
            {message && (
              <div className="reset-message success">
                <span>✓</span>
                {message}
              </div>
            )}

            <form
              className="reset-form"
              onSubmit={verifyOtp}
            >

              <div className="reset-input-group">

                <label>
                  Verification OTP
                </label>

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
                    autoFocus
                  />

                </div>

              </div>

              <button
                type="submit"
                className="reset-submit"
              >
                <span>
                  Next
                </span>

                <span>
                  →
                </span>
              </button>

            </form>

            <button
              type="button"
              className="reset-back-login"
              onClick={goBack}
            >
              ← Change Email
            </button>
          </>
        )}

        {/* ==================================================
            STEP 3 - NEW PASSWORD
        ================================================== */}

        {step === 3 && (
          <>
            <div className="reset-heading">

              <div className="reset-label">
                NEW PASSWORD
              </div>

              <h1>Create New Password</h1>

              <p>
                OTP verified. Create a new password
                for your account.
              </p>

            </div>

            {/* Error */}
            {error && (
              <div className="reset-error">
                <span>!</span>
                <p>{error}</p>
              </div>
            )}

            {/* Success */}
            {message && (
              <div className="reset-message success">
                <span>✓</span>
                {message}
              </div>
            )}

            <form
              className="reset-form"
              onSubmit={handleResetPassword}
            >

              {/* New Password */}

              <div className="reset-input-group">

                <label>
                  New Password
                </label>

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
                    className="reset-eye"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                  >
                    {showPassword
                      ? "🙈"
                      : "👁"}
                  </button>

                </div>

              </div>

              {/* Confirm Password */}

              <div className="reset-input-group">

                <label>
                  Confirm Password
                </label>

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
                    className="reset-eye"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                  >
                    {showConfirmPassword
                      ? "🙈"
                      : "👁"}
                  </button>

                </div>

              </div>

              <button
                type="submit"
                className="reset-submit"
                disabled={loading}
              >
                <span>
                  {loading
                    ? "Resetting Password..."
                    : "Reset Password"}
                </span>

                <span>
                  →
                </span>
              </button>

            </form>

            <button
              type="button"
              className="reset-back-login"
              onClick={goBack}
            >
              ← Back to OTP
            </button>
          </>
        )}

        {/* Security */}
        <div className="reset-security">
          🔒 Your account security is our priority.
        </div>

      </div>
    </div>
  );
}

export default ResetPassword;