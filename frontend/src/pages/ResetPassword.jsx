import React, { useState } from "react";
import { forgotPassword, resetPassword } from "../services/api";
import "./ResetPassword.css";

function ResetPassword() {
  const [step, setStep] = useState(1);

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

  // ==========================================
  // STEP 1 - SEND OTP
  // ==========================================
  const handleSendOtp = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await forgotPassword(cleanEmail);

      console.log("FORGOT PASSWORD RESPONSE:", response);

      // Backend sends this when OTP was successfully sent
      setMessage("OTP sent successfully. Check your email.");

      // Move automatically to OTP page
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

  // ==========================================
  // STEP 2 - OTP
  // ==========================================
  const handleNext = (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    const cleanOtp = otp.trim();

    if (!cleanOtp) {
      setError("Please enter the OTP.");
      return;
    }

    if (!/^\d{6}$/.test(cleanOtp)) {
      setError("OTP must be exactly 6 digits.");
      return;
    }

    setStep(3);
  };

  // ==========================================
  // STEP 3 - RESET PASSWORD
  // ==========================================
  const handleResetPassword = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!password) {
      setError("Please enter a new password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
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

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Invalid OTP.");
      setStep(2);
      return;
    }

    try {
      setLoading(true);

      const response = await resetPassword(
        email.trim().toLowerCase(),
        otp.trim(),
        password
      );

      console.log("RESET PASSWORD RESPONSE:", response);

      setMessage(
        "Password reset successful. Redirecting to login..."
      );

      // Clear fields
      setOtp("");
      setPassword("");
      setConfirmPassword("");

      // Go to login after success
      setTimeout(() => {
        window.location.href = "/";
      }, 1800);
    } catch (err) {
      console.error("RESET PASSWORD ERROR:", err);

      setError(
        err.message ||
          "Unable to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // BACK TO LOGIN
  // ==========================================
  const goToLogin = () => {
    window.location.href = "/";
  };

  // ==========================================
  // BACK
  // ==========================================
  const goBack = () => {
    setError("");
    setMessage("");

    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
    }
  };

  return (
    <div className="reset-page">

      <div className="reset-background">
        <div className="reset-orb reset-orb-one"></div>
        <div className="reset-orb reset-orb-two"></div>
        <div className="reset-grid"></div>
      </div>

      <div className="reset-card">

        {/* LOGO */}
        <div className="reset-logo">
          ₹
        </div>

        {/* ======================================
            STEP 1
        ====================================== */}
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

            {error && (
              <div className="reset-error">
                <span>!</span>
                <p>{error}</p>
              </div>
            )}

            <form
              className="reset-form"
              onSubmit={handleSendOtp}
            >
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
                    disabled={loading}
                    autoComplete="email"
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

                <span>→</span>
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

        {/* ======================================
            STEP 2
        ====================================== */}
        {step === 2 && (
          <>
            <div className="reset-heading">
              <div className="reset-label">
                VERIFICATION
              </div>

              <h1>Enter OTP</h1>

              <p>
                We sent a 6-digit OTP to
                <br />
                <strong>{email}</strong>
              </p>
            </div>

            {error && (
              <div className="reset-error">
                <span>!</span>
                <p>{error}</p>
              </div>
            )}

            {message && (
              <div className="reset-success">
                <span>✓</span>
                <p>{message}</p>
              </div>
            )}

            <form
              className="reset-form"
              onSubmit={handleNext}
            >
              <div className="reset-input-group">
                <label>Verification OTP</label>

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
                <span>Next</span>
                <span>→</span>
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

        {/* ======================================
            STEP 3
        ====================================== */}
        {step === 3 && (
          <>
            <div className="reset-heading">
              <div className="reset-label">
                NEW PASSWORD
              </div>

              <h1>Create New Password</h1>

              <p>
                Enter and confirm your new password.
              </p>
            </div>

            {error && (
              <div className="reset-error">
                <span>!</span>
                <p>{error}</p>
              </div>
            )}

            {message && (
              <div className="reset-success">
                <span>✓</span>
                <p>{message}</p>
              </div>
            )}

            <form
              className="reset-form"
              onSubmit={handleResetPassword}
            >

              {/* NEW PASSWORD */}
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
                    className="reset-eye"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
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
                    ? "Resetting..."
                    : "Reset Password"}
                </span>

                <span>→</span>
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

        <div className="reset-security">
          🔒 Your account security is our priority.
        </div>

      </div>
    </div>
  );
}

export default ResetPassword;