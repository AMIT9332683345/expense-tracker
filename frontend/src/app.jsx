import React, { useState } from "react";
import "./app.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";

import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

function App() {
  const currentPath =
    window.location.pathname;

  // ========================================
  // GET SAVED TOKEN
  // ========================================
  const getSavedToken = () => {
    return (
      localStorage.getItem("token") ||
      sessionStorage.getItem("token")
    );
  };

  const [token, setToken] =
    useState(getSavedToken());

  const [activePage, setActivePage] =
    useState("dashboard");

  const [showRegister, setShowRegister] =
    useState(false);

  // ========================================
  // LOGIN
  // ========================================
  const handleLogin = (newToken) => {
    setToken(newToken);
    setShowRegister(false);
  };

  // ========================================
  // REGISTER SUCCESS
  // ========================================
  const handleRegisterSuccess =
    (newToken) => {
      setToken(newToken);
      setShowRegister(false);
    };

  // ========================================
  // LOGOUT
  // ========================================
  const handleLogout = () => {
    // Remove authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    // Update React state
    setToken(null);

    // Reset active page
    setActivePage("dashboard");

    // Close register screen if open
    setShowRegister(false);
  };

  // ========================================
  // RESET PASSWORD PAGE
  // ========================================
  if (
    currentPath === "/reset-password"
  ) {
    return <ResetPassword />;
  }

  // ========================================
  // AUTHENTICATION CHECK
  // ========================================
  if (!token) {
    return (
      <div className="auth-ui">
        {showRegister ? (
          <Register
            onRegisterSuccess={
              handleRegisterSuccess
            }
            onLoginClick={() =>
              setShowRegister(false)
            }
          />
        ) : (
          <Login
            onLogin={handleLogin}
            onRegisterClick={() =>
              setShowRegister(true)
            }
          />
        )}
      </div>
    );
  }

  // ========================================
  // RENDER ACTIVE PAGE
  // ========================================
  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <Dashboard
            onLogout={handleLogout}
          />
        );

      case "categories":
        return <Categories />;

      case "transactions":
        return <Transactions />;

      case "reports":
        return <Reports />;

      case "settings":
        return (
          <Settings
            onLogout={handleLogout}
          />
        );

      default:
        return (
          <Dashboard
            onLogout={handleLogout}
          />
        );
    }
  };

  // ========================================
  // MAIN APP
  // ========================================
  return (
    <div className="app-layout">

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={handleLogout}
      />

      <main className="main-content">

        {/* Navbar Logout Connection */}
        <Navbar
          activePage={activePage}
          onLogout={handleLogout}
        />

        <div className="app-ui-transition">
          {renderPage()}
        </div>

      </main>
    </div>
  );
}

export default App;