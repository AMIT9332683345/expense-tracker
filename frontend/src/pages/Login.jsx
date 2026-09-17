import React, { useEffect, useState } from "react";

import {
  loginUser,
  forgotPassword,
  resetPassword,
  googleLogin
} from "../services/api";

import { GoogleLogin } from "@react-oauth/google";

import "./Login.css";


function Login({
  onLogin,
  onRegisterClick
}) {

  // =========================================================
  // LOGIN STATES
  // =========================================================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  // =========================================================
  // FORGOT PASSWORD STATES
  // =========================================================

  const [showForgot, setShowForgot] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");

  const [forgotNewPassword, setForgotNewPassword] =
    useState("");

  const [forgotConfirmPassword, setForgotConfirmPassword] =
    useState("");

  const [showForgotNewPassword, setShowForgotNewPassword] =
    useState(false);

  const [showForgotConfirmPassword, setShowForgotConfirmPassword] =
    useState(false);

  const [forgotLoading, setForgotLoading] =
    useState(false);

  const [resetLoading, setResetLoading] =
    useState(false);

  const [forgotMessage, setForgotMessage] =
    useState("");

  const [forgotSuccess, setForgotSuccess] =
    useState(false);

  const [otpSent, setOtpSent] =
    useState(false);


  // =========================================================
  // LOAD REMEMBERED EMAIL
  // =========================================================

  useEffect(() => {

    const savedEmail =
      localStorage.getItem("rememberedEmail");

    if (savedEmail) {

      setEmail(savedEmail);
      setRememberMe(true);

    }

  }, []);


  // =========================================================
  // SAVE LOGIN SESSION
  // =========================================================

  const saveLoginSession = (data, userEmail) => {

    localStorage.removeItem("token");
    sessionStorage.removeItem("token");

    localStorage.removeItem("user");
    sessionStorage.removeItem("user");


    if (rememberMe) {

      localStorage.setItem(
        "token",
        data.token
      );

      if (data.user) {

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

      }

      localStorage.setItem(
        "rememberedEmail",
        userEmail || data.user?.email || ""
      );

    } else {

      sessionStorage.setItem(
        "token",
        data.token
      );

      if (data.user) {

        sessionStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

      }

      localStorage.removeItem(
        "rememberedEmail"
      );

    }

  };


  // =========================================================
  // NORMAL LOGIN
  // =========================================================

  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");

    if (!email.trim()) {

      setError(
        "Please enter your email address."
      );

      return;

    }

    if (!password.trim()) {

      setError(
        "Please enter your password."
      );

      return;

    }


    try {

      setLoading(true);

      const data =
        await loginUser(
          email.trim(),
          password
        );


      if (
        data?.success &&
        data?.token
      ) {

        saveLoginSession(
          data,
          email.trim()
        );


        if (onLogin) {

          onLogin(data.token);

        }

      } else {

        setError(
          data?.message ||
          "Invalid email or password."
        );

      }

    } catch (err) {

      console.error(
        "LOGIN ERROR:",
        err
      );

      setError(
        err?.message ||
        "Unable to login. Please try again."
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // GOOGLE LOGIN
  // =========================================================

  const handleGoogleLogin = async (
    credentialResponse
  ) => {

    try {

      setError("");

      setLoading(true);


      const credential =
        credentialResponse?.credential;


      if (!credential) {

        setError(
          "Google authentication failed."
        );

        return;

      }


      const data =
        await googleLogin(
          credential
        );


      // IMPORTANT:
      // No Google success message.
      // No extra popup.
      // Directly login to the application.

      if (
        data?.success &&
        data?.token
      ) {

        saveLoginSession(
          data,
          data.user?.email
        );


        if (onLogin) {

          onLogin(data.token);

        }

        return;

      }


      setError(
        data?.message ||
        "Google login failed."
      );

    } catch (err) {

      console.error(
        "GOOGLE LOGIN ERROR:",
        err
      );

      setError(
        err?.message ||
        "Google login failed. Please try again."
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // GOOGLE LOGIN ERROR
  // =========================================================

  const handleGoogleError = () => {

    setError(
      "Google login was cancelled or failed. Please try again."
    );

  };


  // =========================================================
  // SEND OTP
  // =========================================================

  const sendOtp = async () => {

    setForgotMessage("");
    setForgotSuccess(false);


    if (!forgotEmail.trim()) {

      setForgotMessage(
        "Please enter your email address."
      );

      return false;

    }


    try {

      setForgotLoading(true);


      const data =
        await forgotPassword(
          forgotEmail.trim()
        );


      if (!data?.success) {

        setForgotMessage(
          data?.message ||
          "Unable to send OTP."
        );

        setForgotSuccess(false);

        return false;

      }


      // =====================================================
      // OTP SUCCESS
      // =====================================================

      setOtpSent(true);

      setForgotSuccess(true);

      setForgotMessage(
        "OTP sent successfully"
      );


      return true;

    } catch (err) {

      console.error(
        "SEND OTP ERROR:",
        err
      );

      setForgotSuccess(false);

      setForgotMessage(
        err?.message ||
        "Unable to send OTP. Please try again."
      );

      return false;

    } finally {

      setForgotLoading(false);

    }

  };


  // =========================================================
  // SEND OTP FORM
  // =========================================================

  const handleForgotPassword = async (e) => {

    e.preventDefault();

    await sendOtp();

  };


  // =========================================================
  // RESET PASSWORD
  // =========================================================

  const handleResetPassword = async (e) => {

    e.preventDefault();

    setForgotMessage("");
    setForgotSuccess(false);


    // EMAIL

    if (!forgotEmail.trim()) {

      setForgotMessage(
        "Please enter your email address."
      );

      return;

    }


    // OTP

    if (!forgotOtp.trim()) {

      setForgotMessage(
        "Please enter the OTP sent to your email."
      );

      return;

    }


    if (
      forgotOtp.trim().length !== 6
    ) {

      setForgotMessage(
        "OTP must be 6 digits."
      );

      return;

    }


    // NEW PASSWORD

    if (!forgotNewPassword) {

      setForgotMessage(
        "Please enter your new password."
      );

      return;

    }


    if (
      forgotNewPassword.length < 6
    ) {

      setForgotMessage(
        "Password must be at least 6 characters."
      );

      return;

    }


    // CONFIRM PASSWORD

    if (!forgotConfirmPassword) {

      setForgotMessage(
        "Please confirm your new password."
      );

      return;

    }


    if (
      forgotNewPassword !==
      forgotConfirmPassword
    ) {

      setForgotMessage(
        "Passwords do not match."
      );

      return;

    }


    // =====================================================
    // API
    // =====================================================

    try {

      setResetLoading(true);


      const data =
        await resetPassword(
          forgotEmail.trim(),
          forgotOtp.trim(),
          forgotNewPassword
        );


      if (!data?.success) {

        setForgotSuccess(false);

        setForgotMessage(
          data?.message ||
          "Unable to reset password."
        );

        return;

      }


      // =====================================================
      // RESET SUCCESS
      // =====================================================

      setForgotSuccess(true);

      setForgotMessage(
        "Password reset successful. Logging you in..."
      );


      // =====================================================
      // DIRECT LOGIN
      // =====================================================

      if (
        data?.token
      ) {

        saveLoginSession(
          data,
          forgotEmail.trim()
        );


        setForgotOtp("");
        setForgotNewPassword("");
        setForgotConfirmPassword("");


        if (onLogin) {

          onLogin(data.token);

        }

        return;

      }


      // If backend doesn't return token,
      // return to login screen instead.

      setForgotSuccess(false);

      setForgotMessage(
        "Password reset successful. Please login with your new password."
      );


      setTimeout(() => {

        setEmail(
          forgotEmail.trim()
        );

        setShowForgot(false);

        setForgotOtp("");
        setForgotNewPassword("");
        setForgotConfirmPassword("");
        setForgotMessage("");
        setForgotSuccess(false);
        setOtpSent(false);

      }, 1200);


    } catch (err) {

      console.error(
        "RESET PASSWORD ERROR:",
        err
      );

      setForgotSuccess(false);

      setForgotMessage(
        err?.message ||
        "Unable to reset password. Please try again."
      );

    } finally {

      setResetLoading(false);

    }

  };


  // =========================================================
  // REGISTER
  // =========================================================

  const handleRegister = () => {

    if (onRegisterClick) {

      onRegisterClick();

    }

  };


  // =========================================================
  // BACK TO LOGIN
  // =========================================================

  const handleBackToLogin = () => {

    setShowForgot(false);

    setForgotEmail("");
    setForgotOtp("");

    setForgotNewPassword("");
    setForgotConfirmPassword("");

    setForgotMessage("");
    setForgotSuccess(false);

    setOtpSent(false);

    setShowForgotNewPassword(false);
    setShowForgotConfirmPassword(false);

  };


  // =========================================================
  // CHANGE FORGOT EMAIL
  // =========================================================

  const handleForgotEmailChange = (e) => {

    setForgotEmail(
      e.target.value
    );

    setOtpSent(false);

    setForgotOtp("");

    setForgotNewPassword("");
    setForgotConfirmPassword("");

    setForgotMessage("");
    setForgotSuccess(false);

  };


  // =========================================================
  // FORGOT PASSWORD SCREEN
  // =========================================================

  if (showForgot) {

    return (

      <div className="login-page">

        <div className="login-background">

          <div className="bg-grid"></div>

          <div className="blue-glow glow-one"></div>
          <div className="blue-glow glow-two"></div>
          <div className="blue-glow glow-three"></div>

          <div className="lightning-line"></div>
          <div className="lightning-line lightning-two"></div>

          <div className="bg-circle circle-one"></div>
          <div className="bg-circle circle-two"></div>

        </div>


        {/* BRAND */}

        <div className="brand">

          <div className="brand-icon">

            <span>₹</span>

          </div>

          <div className="brand-info">

            <h2>
              Expense <span>Tracker</span>
            </h2>

            <p>
              Track&nbsp; • &nbsp;Plan&nbsp; • &nbsp;Grow
            </p>

          </div>

        </div>


        {/* FORGOT CONTENT */}

        <main className="login-content">

          <section className="login-section">

            <div className="login-card">

              <div className="card-glow"></div>


              {/* CARD BRAND */}

              <div className="card-brand">

                <div className="small-logo">
                  ₹
                </div>

                <h2>
                  Expense <span>Tracker</span>
                </h2>

              </div>


              {/* HEADING */}

              <div className="login-heading">

                <h1>
                  Forgot Password?
                </h1>

                <p>

                  {otpSent
                    ? "Enter the OTP sent to your email and create a new password."
                    : "Enter your email and we'll send you a secure OTP."
                  }

                </p>

              </div>


              {/* =================================================
                  SUCCESS MESSAGE
                  ONLY ONE SUCCESS MESSAGE
              ================================================= */}

              {forgotSuccess && (

                <div className="reset-success">

                  <strong>
                    ✓ OTP Sent Successfully
                  </strong>

                  <span>
                    {forgotMessage}
                  </span>

                </div>

              )}


              {/* ERROR */}

              {forgotMessage &&
                !forgotSuccess && (

                  <div className="login-error">

                    <span className="error-icon">
                      !
                    </span>

                    <span>
                      {forgotMessage}
                    </span>

                  </div>

                )}


              {/* =================================================
                  STEP 1
              ================================================= */}

              {!otpSent && (

                <form
                  onSubmit={handleForgotPassword}
                  className="login-form"
                >

                  <div className="input-group">

                    <label>
                      Email Address
                    </label>

                    <div className="input-wrapper">

                      <span className="input-icon">
                        ✉
                      </span>

                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={forgotEmail}
                        onChange={
                          handleForgotEmailChange
                        }
                        autoComplete="email"
                        required
                      />

                    </div>

                  </div>


                  <button
                    type="submit"
                    className="login-button"
                    disabled={forgotLoading}
                  >

                    {forgotLoading ? (

                      <>
                        <span className="spinner"></span>
                        <span>Sending OTP...</span>
                      </>

                    ) : (

                      <>
                        <span>Send OTP</span>
                        <span className="arrow">→</span>
                      </>

                    )}

                  </button>

                </form>

              )}


              {/* =================================================
                  STEP 2
              ================================================= */}

              {otpSent && (

                <form
                  onSubmit={handleResetPassword}
                  className="login-form"
                >

                  {/* EMAIL */}

                  <div className="input-group">

                    <label>
                      Email Address
                    </label>

                    <div className="input-wrapper">

                      <span className="input-icon">
                        ✉
                      </span>

                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={forgotEmail}
                        onChange={
                          handleForgotEmailChange
                        }
                        autoComplete="email"
                        required
                      />

                    </div>

                  </div>


                  {/* OTP */}

                  <div className="input-group">

                    <label>
                      Enter OTP
                    </label>

                    <div className="input-wrapper">

                      <span className="input-icon">
                        #
                      </span>

                      <input
                        className="otp-input"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Enter 6-digit OTP"
                        value={forgotOtp}
                        onChange={(e) => {

                          const value =
                            e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6);

                          setForgotOtp(value);

                          setForgotMessage("");
                          setForgotSuccess(false);

                        }}
                        autoComplete="one-time-code"
                        required
                      />

                    </div>

                  </div>


                  {/* NEW PASSWORD */}

                  <div className="input-group">

                    <label>
                      New Password
                    </label>

                    <div className="input-wrapper">

                      <input
                        type={
                          showForgotNewPassword
                            ? "text"
                            : "password"
                        }
                        placeholder="Enter new password"
                        value={forgotNewPassword}
                        onChange={(e) => {

                          setForgotNewPassword(
                            e.target.value
                          );

                          setForgotMessage("");
                          setForgotSuccess(false);

                        }}
                        autoComplete="new-password"
                        required
                      />

                      <button
                        type="button"
                        className="eye-button"
                        onClick={() =>
                          setShowForgotNewPassword(
                            !showForgotNewPassword
                          )
                        }
                      >

                        {showForgotNewPassword
                          ? "◉"
                          : "◌"}

                      </button>

                    </div>

                  </div>


                  {/* CONFIRM PASSWORD */}

                  <div className="input-group">

                    <label>
                      Confirm New Password
                    </label>

                    <div className="input-wrapper">

                      <input
                        type={
                          showForgotConfirmPassword
                            ? "text"
                            : "password"
                        }
                        placeholder="Confirm new password"
                        value={
                          forgotConfirmPassword
                        }
                        onChange={(e) => {

                          setForgotConfirmPassword(
                            e.target.value
                          );

                          setForgotMessage("");
                          setForgotSuccess(false);

                        }}
                        autoComplete="new-password"
                        required
                      />

                      <button
                        type="button"
                        className="eye-button"
                        onClick={() =>
                          setShowForgotConfirmPassword(
                            !showForgotConfirmPassword
                          )
                        }
                      >

                        {showForgotConfirmPassword
                          ? "◉"
                          : "◌"}

                      </button>

                    </div>

                  </div>


                  {/* RESET BUTTON */}

                  <button
                    type="submit"
                    className="login-button"
                    disabled={resetLoading}
                  >

                    {resetLoading ? (

                      <>
                        <span className="spinner"></span>
                        <span>
                          Resetting Password...
                        </span>
                      </>

                    ) : (

                      <>
                        <span>
                          Reset Password
                        </span>

                        <span className="arrow">
                          →
                        </span>
                      </>

                    )}

                  </button>


                  {/* RESEND */}

                  <button
                    type="button"
                    className="resend-otp-button"
                    onClick={sendOtp}
                    disabled={forgotLoading}
                  >

                    {forgotLoading
                      ? "Sending OTP..."
                      : "Didn't receive OTP? Resend OTP"
                    }

                  </button>

                </form>

              )}


              {/* BACK LOGIN */}

              <div className="register-text">

                <span>
                  Remember your password?
                </span>

                <button
                  type="button"
                  onClick={handleBackToLogin}
                >
                  Back to Login
                </button>

              </div>


              {/* SECURITY */}

              <div className="secure-login">

                <span>
                  Your OTP is secure and expires after 10 minutes
                </span>

              </div>

            </div>

          </section>

        </main>


        {/* CURTAINS */}

        <div className="curtain curtain-left">

          <div className="curtain-folds"></div>

        </div>

        <div className="curtain curtain-right">

          <div className="curtain-folds"></div>

        </div>

      </div>

    );

  }


  // =========================================================
  // NORMAL LOGIN SCREEN
  // =========================================================

  return (

    <div className="login-page">

      <div className="login-background">

        <div className="bg-grid"></div>

        <div className="blue-glow glow-one"></div>
        <div className="blue-glow glow-two"></div>
        <div className="blue-glow glow-three"></div>

        <div className="lightning-line"></div>
        <div className="lightning-line lightning-two"></div>

        <div className="bg-circle circle-one"></div>
        <div className="bg-circle circle-two"></div>

      </div>


      {/* BRAND */}

      <div className="brand">

        <div className="brand-icon">

          <span>₹</span>

        </div>

        <div className="brand-info">

          <h2>
            Expense <span>Tracker</span>
          </h2>

          <p>
            Track&nbsp; • &nbsp;Plan&nbsp; • &nbsp;Grow
          </p>

        </div>

      </div>


      <main className="login-content">


        {/* LEFT */}

        <section className="login-intro">

          <div className="intro-content">

            <div className="intro-badge">

              <span className="badge-dot"></span>

              SMART FINANCE MANAGEMENT

            </div>


            <h1>

              Take Control of<br />

              Your <span>Finances</span>

            </h1>


            <h3>
              Simple. Secure. Powerful.
            </h3>


            <p className="intro-description">

              Track your expenses, manage your budget
              and build a better financial future —
              all in one place.

            </p>


            <div className="feature-row">

              <div className="feature">

                <div className="feature-icon">
                  <span>↗</span>
                </div>

                <div className="feature-text">

                  <strong>
                    Track
                  </strong>

                  <span>
                    Expenses
                  </span>

                </div>

              </div>


              <div className="feature">

                <div className="feature-icon">
                  <span>◇</span>
                </div>

                <div className="feature-text">

                  <strong>
                    Set
                  </strong>

                  <span>
                    Budgets
                  </span>

                </div>

              </div>


              <div className="feature">

                <div className="feature-icon">
                  <span>◎</span>
                </div>

                <div className="feature-text">

                  <strong>
                    Reach
                  </strong>

                  <span>
                    Your Goals
                  </span>

                </div>

              </div>

            </div>


            <div className="intro-stats">

              <div className="stat-item">

                <strong>
                  100%
                </strong>

                <span>
                  Secure
                </span>

              </div>

              <div className="stat-line"></div>

              <div className="stat-item">

                <strong>
                  24/7
                </strong>

                <span>
                  Accessible
                </span>

              </div>

              <div className="stat-line"></div>

              <div className="stat-item">

                <strong>
                  Smart
                </strong>

                <span>
                  Tracking
                </span>

              </div>

            </div>

          </div>


          <div className="money-text">

            <span>
              Better Money
            </span>

            <span>
              Bigger Dreams
            </span>

            <div className="money-line"></div>

          </div>

        </section>


        {/* LOGIN CARD */}

        <section className="login-section">

          <div className="login-card">

            <div className="card-glow"></div>


            <div className="card-brand">

              <div className="small-logo">
                ₹
              </div>

              <h2>
                Expense <span>Tracker</span>
              </h2>

            </div>


            <div className="login-heading">

              <h1>
                Welcome Back
              </h1>

              <p>
                Login to your account and continue your journey.
              </p>

            </div>


            {error && (

              <div className="login-error">

                <span className="error-icon">
                  !
                </span>

                <span>
                  {error}
                </span>

              </div>

            )}


            <form
              onSubmit={handleLogin}
              className="login-form"
            >

              {/* EMAIL */}

              <div className="input-group">

                <label>
                  Email Address
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    ✉
                  </span>

                  <input
                    type="email"
                    placeholder="Enter your email"
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

              <div className="input-group">

                <label>
                  Password
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    🔒
                  </span>

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {

                      setPassword(
                        e.target.value
                      );

                      setError("");

                    }}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="eye-button"
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


              {/* OPTIONS */}

              <div className="login-options">

                <label className="remember">

                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(
                        e.target.checked
                      )
                    }
                  />

                  <span className="custom-checkbox"></span>

                  <span>
                    Remember me
                  </span>

                </label>


                <button
                  type="button"
                  className="forgot-button"
                  onClick={() => {

                    setForgotEmail(email);

                    setShowForgot(true);

                    setForgotMessage("");

                    setForgotSuccess(false);

                    setOtpSent(false);

                  }}
                >

                  Forgot password?

                </button>

              </div>


              {/* LOGIN */}

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >

                {loading ? (

                  <>
                    <span className="spinner"></span>

                    <span>
                      Logging in...
                    </span>
                  </>

                ) : (

                  <>
                    <span>
                      Login
                    </span>

                    <span className="arrow">
                      →
                    </span>
                  </>

                )}

              </button>

            </form>


            {/* DIVIDER */}

            <div className="divider">

              <span></span>

              <p>
                Or
              </p>

              <span></span>

            </div>


            {/* GOOGLE LOGIN */}

            <div className="google-button-wrapper">

              <GoogleLogin
                onSuccess={
                  handleGoogleLogin
                }
                onError={
                  handleGoogleError
                }
                useOneTap={false}
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
                width="100%"
              />

            </div>


            {/* REGISTER */}

            <div className="register-text">

              <span>
                Don't have an account?
              </span>

              <button
                type="button"
                onClick={handleRegister}
              >
                Register
              </button>

            </div>


            {/* SECURITY */}

            <div className="secure-login">

              <span>
                Your information is encrypted and secure
              </span>

            </div>

          </div>

        </section>

      </main>


      {/* RESULT */}

      <div className="result-text">

        <span>
          Small Steps
        </span>

        <strong>
          Big Results
        </strong>

        <div className="result-line"></div>

      </div>


      {/* CURTAINS */}

      <div className="curtain curtain-left">

        <div className="curtain-folds"></div>

      </div>

      <div className="curtain curtain-right">

        <div className="curtain-folds"></div>

      </div>

    </div>

  );

}


export default Login;