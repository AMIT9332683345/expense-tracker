// ======================================================
// API CONFIG
// ======================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

// ======================================================
// GET AUTH TOKEN
// ======================================================

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
};

// ======================================================
// COMMON REQUEST
// ======================================================

const request = async (endpoint, options = {}) => {
  try {
    const token = getToken();

    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const text = await response.text();

    let data;

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(
        "Invalid server response. Please check the backend server."
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          data?.error ||
          `Request failed with status ${response.status}`
      );
    }

    return data;
  } catch (error) {
    console.error("API ERROR:", error);

    throw new Error(
      error?.message ||
        "Unable to connect to the server."
    );
  }
};

// ======================================================
// AUTH
// ======================================================

export const registerUser = async (
  name,
  email,
  password
) => {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });
};

export const loginUser = async (
  email,
  password
) => {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
};

export const googleLogin = async (credential) => {
  return request("/auth/google", {
    method: "POST",
    body: JSON.stringify({
      credential,
    }),
  });
};

export const forgotPassword = async (email) => {
  return request("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({
      email,
    }),
  });
};

export const resetPassword = async (
  email,
  otp,
  newPassword
) => {
  return request("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({
      email,
      otp,
      newPassword,
    }),
  });
};

// ======================================================
// DASHBOARD
// ======================================================

export const getDashboard = async () => {
  return request("/dashboard", {
    method: "GET",
  });
};

// ======================================================
// CATEGORIES
// ======================================================

export const getCategories = async () => {
  return request("/categories", {
    method: "GET",
  });
};

export const createCategory = async (
  name,
  type
) => {
  return request("/categories", {
    method: "POST",
    body: JSON.stringify({
      name,
      type,
    }),
  });
};

export const updateCategory = async (
  id,
  name,
  type
) => {
  return request(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      name,
      type,
    }),
  });
};

export const deleteCategory = async (id) => {
  return request(`/categories/${id}`, {
    method: "DELETE",
  });
};

// ======================================================
// TRANSACTIONS
// ======================================================

export const getTransactions = async () => {
  return request("/transactions", {
    method: "GET",
  });
};

export const getTransaction = async (id) => {
  return request(`/transactions/${id}`, {
    method: "GET",
  });
};

export const createTransaction = async (
  transaction
) => {
  return request("/transactions", {
    method: "POST",
    body: JSON.stringify(transaction),
  });
};

export const updateTransaction = async (
  id,
  transaction
) => {
  return request(`/transactions/${id}`, {
    method: "PUT",
    body: JSON.stringify(transaction),
  });
};

export const deleteTransaction = async (id) => {
  return request(`/transactions/${id}`, {
    method: "DELETE",
  });
};

// ======================================================
// DEFAULT API OBJECT
// ======================================================

const api = {
  registerUser,
  loginUser,
  googleLogin,
  forgotPassword,
  resetPassword,

  getDashboard,

  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,

  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};

export default api;