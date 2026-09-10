import React, { useState } from "react";
import {
  registerUser,
  loginUser
} from "../services/api";
import "./Register.css";

function Register({
  onRegisterSuccess,
  onLoginClick
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [agreeTerms, setAgreeTerms] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  // ========================================
  // REGISTER
  // ========================================
  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please create a password.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    if (!agreeTerms) {
      setError(
        "Please agree to the Terms and Privacy Policy."
      );
      return;
    }

    try {
      setLoading(true);

      // ==================================
      // REGISTER
      // ==================================
      const registerData =
        await registerUser(
          name.trim(),
          email.trim(),
          password
        );

      if (!registerData.success) {
        throw new Error(
          registerData.message ||
          "Registration failed."
        );
      }


      // ==================================
      // AUTO LOGIN
      // ==================================
      const loginData =
        await loginUser(
          email.trim(),
          password
        );

      if (
        !loginData.success ||
        !loginData.token
      ) {
        throw new Error(
          loginData.message ||
          "Automatic login failed."
        );
      }


      // ==================================
      // CLEAR OLD AUTH
      // ==================================
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");

      localStorage.removeItem("user");
      sessionStorage.removeItem("user");


      // ==================================
      // NEW REGISTERED USER
      // ==================================
      // New users stay logged in for this
      // browser session.
      sessionStorage.setItem(
        "token",
        loginData.token
      );

      if (loginData.user) {
        sessionStorage.setItem(
          "user",
          JSON.stringify(loginData.user)
        );
      }


      // ==================================
      // SEND TOKEN TO APP
      // ==================================
      if (onRegisterSuccess) {
        onRegisterSuccess(
          loginData.token
        );
      }

    } catch (err) {
      console.error(
        "REGISTER ERROR:",
        err
      );

      setError(
        err?.message ||
        "Registration failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };


  // ========================================
  // LOGIN PAGE
  // ========================================
  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    }
  };


  return (
    <div className="register-page">

      {/* ====================================
          BACKGROUND
      ==================================== */}

      <div className="register-bg">

        <div className="register-orb orb-one"></div>

        <div className="register-orb orb-two"></div>

        <div className="register-grid"></div>

      </div>


      {/* ====================================
          LEFT BRAND PANEL
      ==================================== */}

      <section className="register-showcase">

        <div className="showcase-content">

          <div className="register-logo">
            <span>₹</span>
          </div>

          <p className="showcase-label">
            EXPENSE TRACKER
          </p>

          <h1>
            Build better
            <br />
            <span>
              money habits.
            </span>
          </h1>

          <p className="showcase-description">
            Start tracking your spending,
            understand your habits and take
            control of your financial future.
          </p>


          {/* FEATURES */}

          <div className="register-features">

            <div className="register-feature">

              <div className="register-feature-icon">
                ✓
              </div>

              <div>
                <strong>
                  Track everything
                </strong>

                <span>
                  Keep your income and expenses organized.
                </span>
              </div>

            </div>


            <div className="register-feature">

              <div className="register-feature-icon">
                ✓
              </div>

              <div>
                <strong>
                  Plan smarter
                </strong>

                <span>
                  Set budgets and stay ahead of your spending.
                </span>
              </div>

            </div>


            <div className="register-feature">

              <div className="register-feature-icon">
                ✓
              </div>

              <div>
                <strong>
                  Grow confidently
                </strong>

                <span>
                  Make better decisions with clear insights.
                </span>
              </div>

            </div>

          </div>

        </div>


        <div className="showcase-bottom">

          <span>
            Track
          </span>

          <span>•</span>

          <span>
            Plan
          </span>

          <span>•</span>

          <span>
            Grow
          </span>

        </div>

      </section>


      {/* ====================================
          REGISTER FORM
      ==================================== */}

      <section className="register-section">

        <div className="register-card">

          <div className="register-card-top">

            <span>
              Create your account
            </span>

            <span className="step-number">
              01
            </span>

          </div>


          <div className="register-heading">

            <h2>
              Get started.
            </h2>

            <p>
              Create your account and start
              managing your money smarter.
            </p>

          </div>


          {/* ERROR */}

          {error && (
            <div className="register-error">

              <span className="register-error-icon">
                !
              </span>

              <span>
                {error}
              </span>

            </div>
          )}


          {/* FORM */}

          <form
            className="register-form"
            onSubmit={handleRegister}
          >

            {/* NAME */}

            <div className="register-input-group">

              <label>
                Full Name
              </label>

              <div className="register-input-wrapper">

                <span className="register-input-icon">
                  ◯
                </span>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  autoComplete="name"
                  required
                />

              </div>

            </div>


            {/* EMAIL */}

            <div className="register-input-group">

              <label>
                Email Address
              </label>

              <div className="register-input-wrapper">

                <span className="register-input-icon">
                  @
                </span>

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  autoComplete="email"
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="register-input-group">

              <label>
                Password
              </label>

              <div className="register-input-wrapper">

                <span className="register-input-icon">
                  🔒
                </span>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => {
                    setPassword(
                      e.target.value
                    );
                    setError("");
                  }}
                  autoComplete="new-password"
                  required
                  minLength={6}
                />

                <button
                  type="button"
                  className="register-eye"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >
                  {showPassword
                    ? "◉"
                    : "◌"}
                </button>

              </div>

            </div>


            {/* CONFIRM PASSWORD */}

            <div className="register-input-group">

              <label>
                Confirm Password
              </label>

              <div className="register-input-wrapper">

                <span className="register-input-icon">
                  ✓
                </span>

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(
                      e.target.value
                    );
                    setError("");
                  }}
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="register-eye"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword
                    ? "◉"
                    : "◌"}
                </button>

              </div>

            </div>


            {/* TERMS */}

            <label className="terms-checkbox">

              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) =>
                  setAgreeTerms(
                    e.target.checked
                  )
                }
              />

              <span className="terms-custom"></span>

              <span>
                I agree to the
                {" "}
                <strong>
                  Terms of Service
                </strong>
                {" "}
                and
                {" "}
                <strong>
                  Privacy Policy
                </strong>
              </span>

            </label>


            {/* SUBMIT */}

            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="register-spinner"></span>

                  <span>
                    Creating account...
                  </span>
                </>
              ) : (
                <>
                  <span>
                    Create Account
                  </span>

                  <span className="register-arrow">
                    →
                  </span>
                </>
              )}

            </button>

          </form>


          {/* LOGIN */}

          <div className="register-login">

            <span>
              Already have an account?
            </span>

            <button
              type="button"
              onClick={
                handleLoginClick
              }
            >
              Login
            </button>

          </div>


          {/* SECURITY */}

          <div className="register-security">

            <span>
              🔒
            </span>

            <span>
              Your data is protected with
              secure authentication.
            </span>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Register;