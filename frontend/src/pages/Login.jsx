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
  onRegisterClick,
  onHomeClick
}) {

  // =====================================================
  // LOGIN STATES
  // =====================================================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [rememberMe, setRememberMe] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const [loginSuccess, setLoginSuccess] = useState("");

  const [loading, setLoading] = useState(false);


  // =====================================================
  // FORGOT PASSWORD STATES
  // =====================================================

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


  // =====================================================
  // LOAD REMEMBERED EMAIL
  // =====================================================

  useEffect(() => {

    const savedEmail =
      localStorage.getItem("rememberedEmail");

    if (savedEmail) {

      setEmail(savedEmail);

      setRememberMe(true);

    }

  }, []);


  // =====================================================
  // NORMAL LOGIN
  // =====================================================

  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");
    setLoginSuccess("");


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

        // -----------------------------------------------
        // CLEAR OLD AUTH
        // -----------------------------------------------

        localStorage.removeItem("token");
        sessionStorage.removeItem("token");

        localStorage.removeItem("user");
        sessionStorage.removeItem("user");


        // -----------------------------------------------
        // REMEMBER ME
        // -----------------------------------------------

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
            email.trim()
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


        // -----------------------------------------------
        // LOGIN SUCCESS
        // -----------------------------------------------

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


  // =====================================================
  // GOOGLE LOGIN
  // =====================================================

  const handleGoogleLogin = async (
    credentialResponse
  ) => {

    try {

      setError("");
      setLoginSuccess("");

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


      if (
        data?.success &&
        data?.token
      ) {

        // -----------------------------------------------
        // CLEAR OLD AUTH
        // -----------------------------------------------

        localStorage.removeItem("token");
        sessionStorage.removeItem("token");

        localStorage.removeItem("user");
        sessionStorage.removeItem("user");


        // -----------------------------------------------
        // SAVE AUTH
        // -----------------------------------------------

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
            data.user?.email || ""
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


        // -----------------------------------------------
        // LOGIN
        // -----------------------------------------------

        if (onLogin) {

          onLogin(data.token);

        }

      } else {

        setError(
          data?.message ||
          "Google login failed."
        );

      }

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


  // =====================================================
  // GOOGLE LOGIN ERROR
  // =====================================================

  const handleGoogleError = () => {

    setError(
      "Google login was cancelled or failed. Please try again."
    );

  };


  // =====================================================
  // SEND OTP
  // =====================================================

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


      // -----------------------------------------------
      // OTP SENT
      // -----------------------------------------------

      setOtpSent(true);

      setForgotSuccess(true);

      // Only one clean success text.
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


  // =====================================================
  // FORGOT PASSWORD FORM
  // =====================================================

  const handleForgotPassword = async (e) => {

    e.preventDefault();

    await sendOtp();

  };


  // =====================================================
  // RESET PASSWORD
  // =====================================================

  const handleResetPassword = async (e) => {

    e.preventDefault();


    setForgotMessage("");
    setForgotSuccess(false);


    // -----------------------------------------------
    // EMAIL
    // -----------------------------------------------

    if (!forgotEmail.trim()) {

      setForgotMessage(
        "Please enter your email address."
      );

      return;

    }


    // -----------------------------------------------
    // OTP
    // -----------------------------------------------

    if (!forgotOtp.trim()) {

      setForgotMessage(
        "Please enter the OTP sent to your email."
      );

      return;

    }


    if (forgotOtp.trim().length !== 6) {

      setForgotMessage(
        "OTP must be 6 digits."
      );

      return;

    }


    // -----------------------------------------------
    // NEW PASSWORD
    // -----------------------------------------------

    if (!forgotNewPassword) {

      setForgotMessage(
        "Please enter your new password."
      );

      return;

    }


    if (forgotNewPassword.length < 6) {

      setForgotMessage(
        "Password must be at least 6 characters."
      );

      return;

    }


    // -----------------------------------------------
    // CONFIRM PASSWORD
    // -----------------------------------------------

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


    // =================================================
    // API RESET
    // =================================================

    try {

      setResetLoading(true);


      const data =
        await resetPassword(
          forgotEmail.trim(),
          forgotOtp.trim(),
          forgotNewPassword
        );


      if (!data?.success) {

        setForgotMessage(
          data?.message ||
          "Unable to reset password."
        );

        return;

      }


      // =================================================
      // PASSWORD RESET SUCCESS
      // =================================================

      // Reset all forgot-password fields.

      setForgotOtp("");

      setForgotNewPassword("");

      setForgotConfirmPassword("");

      setForgotSuccess(false);

      setForgotMessage("");


      // Put the reset email into normal login.

      setEmail(
        forgotEmail.trim()
      );


      setPassword("");


      // Go back to normal login.

      setShowForgot(false);

      setOtpSent(false);


      // Show clean green success message on login page.

      setLoginSuccess(
        "Password reset successful. Please login with your new password."
      );


      // Clear old authentication.

      localStorage.removeItem("token");
      sessionStorage.removeItem("token");

      localStorage.removeItem("user");
      sessionStorage.removeItem("user");


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


  // =====================================================
  // REGISTER
  // =====================================================

  const handleRegister = () => {

    if (onRegisterClick) {

      onRegisterClick();

    }

  };


  // =====================================================
  // HOME
  // =====================================================

  const handleHome = () => {

    if (onHomeClick) {

      onHomeClick();

      return;

    }


    // If parent doesn't provide Home handler,
    // simply go back.

    if (window.history.length > 1) {

      window.history.back();

    }

  };


  // =====================================================
  // BACK TO LOGIN
  // =====================================================

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


  // =====================================================
  // FORGOT EMAIL CHANGE
  // =====================================================

  const handleForgotEmailChange = (e) => {

    setForgotEmail(
      e.target.value
    );


    // Changing email starts a fresh OTP flow.

    setOtpSent(false);

    setForgotOtp("");

    setForgotNewPassword("");

    setForgotConfirmPassword("");

    setForgotMessage("");

    setForgotSuccess(false);

  };


  // =====================================================
  // OPEN FORGOT PASSWORD
  // =====================================================

  const openForgotPassword = () => {

    setForgotEmail(
      email.trim()
    );

    setShowForgot(true);

    setForgotMessage("");

    setForgotSuccess(false);

    setOtpSent(false);

    setForgotOtp("");

    setForgotNewPassword("");

    setForgotConfirmPassword("");

  };


  // =====================================================
  // FORGOT PASSWORD SCREEN
  // =====================================================

  if (showForgot) {

    return (

      <div className="login-page">

        {/* BACKGROUND */}

        <div className="login-background">

          <div className="abstract-shape shape-top"></div>

          <div className="abstract-shape shape-bottom"></div>

        </div>


        {/* HOME */}

        <button
          type="button"
          className="home-button"
          onClick={handleHome}
        >
          <span>‹</span>
          <span>Home</span>
        </button>


        {/* FORGOT CONTENT */}

        <main className="login-content">

          <section className="login-section">

            <div className="login-card">


              {/* LOGO */}

              <div className="card-brand">

                <div className="small-logo">
                  R
                </div>

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
                  SUCCESS
              ================================================= */}

              {forgotSuccess && (

                <div className="reset-success">

                  <div className="success-content">

                    <strong>
                      OTP Sent Successfully
                    </strong>

                  </div>

                </div>

              )}


              {/* =================================================
                  ERROR
              ================================================= */}

              {forgotMessage &&
                !forgotSuccess && (

                  <div className="login-error">

                    <span>
                      {forgotMessage}
                    </span>

                  </div>

                )}


              {/* =================================================
                  STEP 1 — EMAIL
              ================================================= */}

              {!otpSent && (

                <form
                  onSubmit={
                    handleForgotPassword
                  }
                  className="login-form"
                >

                  <div className="input-group">

                    <label>
                      Email Address
                    </label>

                    <div className="input-wrapper">

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
                    disabled={
                      forgotLoading
                    }
                  >

                    {forgotLoading ? (

                      <>

                        <span className="spinner"></span>

                        <span>
                          Sending OTP...
                        </span>

                      </>

                    ) : (

                      <>

                        <span>
                          Send OTP
                        </span>

                        <span className="arrow">
                          →
                        </span>

                      </>

                    )}

                  </button>

                </form>

              )}


              {/* =================================================
                  STEP 2 — OTP + PASSWORD
              ================================================= */}

              {otpSent && (

                <form
                  onSubmit={
                    handleResetPassword
                  }
                  className="login-form"
                >

                  {/* EMAIL */}

                  <div className="input-group">

                    <label>
                      Email Address
                    </label>

                    <div className="input-wrapper">

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

                    <div className="input-wrapper otp-wrapper">

                      <input
                        className="otp-input"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
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
                        value={
                          forgotNewPassword
                        }
                        onChange={(e) => {

                          setForgotNewPassword(
                            e.target.value
                          );

                          setForgotMessage("");

                          setForgotSuccess(
                            false
                          );

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
                        aria-label={
                          showForgotNewPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >

                        {showForgotNewPassword
                          ? "Hide"
                          : "Show"}

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

                          setForgotSuccess(
                            false
                          );

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
                        aria-label={
                          showForgotConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >

                        {showForgotConfirmPassword
                          ? "Hide"
                          : "Show"}

                      </button>

                    </div>

                  </div>


                  {/* RESET */}

                  <button
                    type="submit"
                    className="login-button"
                    disabled={
                      resetLoading
                    }
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
                    className="resend-button"
                    onClick={sendOtp}
                    disabled={
                      forgotLoading
                    }
                  >

                    {forgotLoading
                      ? "Sending OTP..."
                      : "Didn't receive OTP? Resend OTP"
                    }

                  </button>

                </form>

              )}


              {/* =================================================
                  BACK TO LOGIN
              ================================================= */}

              <div className="register-text">

                <span>
                  Remember your password?
                </span>

                <button
                  type="button"
                  onClick={
                    handleBackToLogin
                  }
                >
                  Back to Login
                </button>

              </div>

            </div>

          </section>

        </main>

      </div>

    );

  }


  // =====================================================
  // NORMAL LOGIN SCREEN
  // =====================================================

  return (

    <div className="login-page">

      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="login-background">

        <div className="abstract-shape shape-top"></div>

        <div className="abstract-shape shape-bottom"></div>

      </div>


      {/* =================================================
          HOME
      ================================================= */}

      <button
        type="button"
        className="home-button"
        onClick={handleHome}
      >
        <span>‹</span>
        <span>Home</span>
      </button>


      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="login-content">

        <section className="login-section">

          <div className="login-card">


            {/* =================================================
                LOGO
            ================================================= */}

            <div className="card-brand">

              <div className="small-logo">
                R
              </div>

            </div>


            {/* =================================================
                HEADING
            ================================================= */}

            <div className="login-heading">

              <h1>
                Welcome Back
              </h1>

              <p>
                Login to your account and continue your journey.
              </p>

            </div>


            {/* =================================================
                LOGIN SUCCESS
            ================================================= */}

            {loginSuccess && (

              <div className="login-success">

                <span>
                  {loginSuccess}
                </span>

              </div>

            )}


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

              <div className="login-error">

                <span>
                  {error}
                </span>

              </div>

            )}


            {/* =================================================
                LOGIN FORM
            ================================================= */}

            <form
              onSubmit={handleLogin}
              className="login-form"
            >


              {/* EMAIL */}

              <div className="input-group">

                <label>
                  Email
                </label>

                <div className="input-wrapper">

                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {

                      setEmail(
                        e.target.value
                      );

                      setError("");

                      setLoginSuccess("");

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

                      setLoginSuccess("");

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
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >

                    {showPassword
                      ? "Hide"
                      : "Show"}

                  </button>

                </div>

              </div>


              {/* =================================================
                  OPTIONS
              ================================================= */}

              <div className="login-options">

                <label className="remember">

                  <input
                    type="checkbox"
                    checked={
                      rememberMe
                    }
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
                  onClick={
                    openForgotPassword
                  }
                >
                  Forgot password?
                </button>

              </div>


              {/* =================================================
                  LOGIN BUTTON
              ================================================= */}

              <button
                type="submit"
                className="login-button"
                disabled={
                  loading
                }
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


            {/* =================================================
                DIVIDER
            ================================================= */}

            <div className="divider">

              <span></span>

              <p>
                or
              </p>

              <span></span>

            </div>


            {/* =================================================
                GOOGLE LOGIN
            ================================================= */}

            <div className="google-button-wrapper">

              <GoogleLogin
                onSuccess={
                  handleGoogleLogin
                }
                onError={
                  handleGoogleError
                }
                useOneTap={false}
                theme="filled_black"
                size="large"
                text="continue_with"
                shape="rectangular"
                width="100%"
              />

            </div>


            {/* =================================================
                REGISTER
            ================================================= */}

            <div className="register-text">

              <span>
                Don't have an account?
              </span>

              <button
                type="button"
                onClick={
                  handleRegister
                }
              >
                Register
              </button>

            </div>

          </div>

        </section>

      </main>

    </div>

  );

}


export default Login;