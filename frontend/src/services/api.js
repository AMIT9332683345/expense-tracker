import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

// ======================================================
// API CLIENT
// ======================================================

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ======================================================
// HELPER
// ======================================================

const handleResponse = (response) => {
  return response.data;
};

const handleError = (error) => {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again.";

  throw new Error(message);
};

// ======================================================
// REGISTER
// ======================================================

export const registerUser = async (
  name,
  email,
  password
) => {
  try {
    const response = await api.post(
      "/auth/register",
      {
        name,
        email,
        password,
      }
    );

    return handleResponse(response);
  } catch (error) {
    return Promise.reject(
      new Error(
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed."
      )
    );
  }
};

// ======================================================
// LOGIN
// ======================================================

export const loginUser = async (
  email,
  password
) => {
  try {
    const response = await api.post(
      "/auth/login",
      {
        email,
        password,
      }
    );

    return handleResponse(response);
  } catch (error) {
    return Promise.reject(
      new Error(
        error?.response?.data?.message ||
        error?.message ||
        "Login failed."
      )
    );
  }
};

// ======================================================
// GOOGLE LOGIN
// ======================================================

export const googleLogin = async (
  credential
) => {
  try {
    const response = await api.post(
      "/auth/google",
      {
        credential,
      }
    );

    return handleResponse(response);
  } catch (error) {
    return Promise.reject(
      new Error(
        error?.response?.data?.message ||
        error?.message ||
        "Google login failed."
      )
    );
  }
};

// ======================================================
// FORGOT PASSWORD — SEND OTP
// ======================================================

export const forgotPassword = async (
  email
) => {
  try {
    const response = await api.post(
      "/auth/forgot-password",
      {
        email,
      }
    );

    return handleResponse(response);
  } catch (error) {
    return Promise.reject(
      new Error(
        error?.response?.data?.message ||
        error?.message ||
        "Unable to send OTP."
      )
    );
  }
};

// ======================================================
// RESET PASSWORD
// ======================================================

export const resetPassword = async (
  email,
  otp,
  newPassword
) => {
  try {
    const response = await api.post(
      "/auth/reset-password",
      {
        email,
        otp,
        newPassword,
      }
    );

    return handleResponse(response);
  } catch (error) {
    return Promise.reject(
      new Error(
        error?.response?.data?.message ||
        error?.message ||
        "Unable to reset password."
      )
    );
  }
};

// ======================================================
// GET CURRENT USER
// ======================================================

export const getCurrentUser = async (
  token
) => {
  try {
    const response = await api.get(
      "/auth/me",
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

    return handleResponse(response);
  } catch (error) {
    return Promise.reject(
      new Error(
        error?.response?.data?.message ||
        error?.message ||
        "Unable to get user information."
      )
    );
  }
};

// ======================================================
// DEFAULT API
// ======================================================

export default api;