import React from "react";
import "./Settings.css";

function Settings({ onLogout }) {
  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  return (
    <div className="settings-page">

      <div className="page-header">
        <div>
          <h1>Settings</h1>

          <p>
            Manage your account settings.
          </p>
        </div>
      </div>


      {/* ACCOUNT */}

      <div className="settings-card">

        <h2>Account</h2>

        <p className="settings-description">
          Your account information.
        </p>


        <div className="settings-row">

          <div>
            <strong>Name</strong>

            <span>
              {user?.name || "Not available"}
            </span>
          </div>

        </div>


        <div className="settings-row">

          <div>
            <strong>Email</strong>

            <span>
              {user?.email || "Not available"}
            </span>
          </div>

        </div>

      </div>


      {/* SECURITY */}

      <div className="settings-card">

        <h2>Security</h2>

        <p className="settings-description">
          Manage your account security.
        </p>


        <div className="settings-row">

          <div>
            <strong>Password</strong>

            <span>
              Your password is securely stored.
            </span>
          </div>

          <span className="security-badge">
            Protected
          </span>

        </div>

      </div>


      {/* LOGOUT */}

      <div className="settings-card danger-card">

        <h2>Logout</h2>

        <p className="settings-description">
          Sign out from your Expense Tracker account.
        </p>


        <button
          type="button"
          className="settings-logout-btn"
          onClick={() => {
            if (onLogout) {
              onLogout();
            }
          }}
        >
          Logout
        </button>

      </div>

    </div>
  );
}

export default Settings;
