const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

// ========================================
// GET AUTH TOKEN
// ========================================
const getToken = () => {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
};

// ========================================
// COMMON API REQUEST
// ========================================
const request = async (
  endpoint,
  options = {}
) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "Invalid server response"
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Something went wrong"
    );
  }

  return data;
};

// ========================================
// LOGIN
// ========================================
export const loginUser = async (
  email,
  password
) => {
  const response = await fetch(
    `${API_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "Invalid server response"
    );
  }

  console.log(
    "BACKEND LOGIN DATA:",
    data
  );

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Login failed"
    );
  }

  return data;
};

// ========================================
// REGISTER
// ========================================
export const registerUser = async (
  name,
  email,
  password
) => {
  return request(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    }
  );
};

// ========================================
// FORGOT PASSWORD
// ========================================
export const forgotPassword = async (
  email
) => {
  return request(
    "/auth/forgot-password",
    {
      method: "POST",
      body: JSON.stringify({
        email,
      }),
    }
  );
};

// ========================================
// RESET PASSWORD
// ========================================
export const resetPassword = async (
  email,
  otp,
  password
) => {
  return request(
    "/auth/reset-password",
    {
      method: "POST",
      body: JSON.stringify({
        email,
        otp,
        password,
      }),
    }
  );
};

// ========================================
// GOOGLE LOGIN
// ========================================
export const googleLogin = async (
  credential
) => {
  return request(
    "/auth/google",
    {
      method: "POST",
      body: JSON.stringify({
        credential,
      }),
    }
  );
};

// ========================================
// DASHBOARD
// ========================================
export const getDashboard = async () => {
  return request(
    "/dashboard"
  );
};

// ========================================
// CATEGORIES
// ========================================
export const getCategories = async () => {
  return request(
    "/categories"
  );
};

export const createCategory = async (
  name,
  type
) => {
  return request(
    "/categories",
    {
      method: "POST",
      body: JSON.stringify({
        name,
        type,
      }),
    }
  );
};

// ========================================
// TRANSACTIONS
// ========================================
export const getTransactions =
  async () => {
    return request(
      "/transactions"
    );
  };

export const createTransaction =
  async (transaction) => {
    return request(
      "/transactions",
      {
        method: "POST",
        body: JSON.stringify(
          transaction
        ),
      }
    );
  };

export const updateTransaction =
  async (
    id,
    transaction
  ) => {
    return request(
      `/transactions/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(
          transaction
        ),
      }
    );
  };

export const deleteTransaction =
  async (id) => {
    return request(
      `/transactions/${id}`,
      {
        method: "DELETE",
      }
    );
  };