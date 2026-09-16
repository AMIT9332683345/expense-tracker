import React, { useEffect, useRef, useState } from "react";
import "./Navbar.css";

function Navbar({ activePage, onLogout }) {
  const titles = {
    dashboard: "Dashboard",
    categories: "Categories",
    transactions: "Transactions",
    reports: "Reports",
    settings: "Settings",
  };

  const title = titles[activePage] || "Dashboard";

  const userData =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user");

  let user = null;

  try {
    user = userData ? JSON.parse(userData) : null;
  } catch {
    user = null;
  }

  const userName = user?.name || "Amit";
  const userEmail = user?.email || "";

  const avatarLetter = userName.charAt(0).toUpperCase();

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [showProfile, setShowProfile] =
    useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      icon: "💰",
      title: "Welcome to Expense Tracker",
      text: "Your account is ready to use.",
      time: "Now",
      unread: true,
    },
    {
      id: 2,
      icon: "📊",
      title: "Track your spending",
      text: "Add your first transaction to get started.",
      time: "Today",
      unread: true,
    },
    {
      id: 3,
      icon: "🔐",
      title: "Account secured",
      text: "Your account security is active.",
      time: "Today",
      unread: false,
    },
  ]);

  const navbarRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        navbarRef.current &&
        !navbarRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
        setShowProfile(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const unreadCount = notifications.filter(
    (item) => item.unread
  ).length;

  const handleNotificationClick = () => {
    setShowNotifications((prev) => !prev);
    setShowProfile(false);
  };

  const handleProfileClick = () => {
    setShowProfile((prev) => !prev);
    setShowNotifications(false);
  };

  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        unread: false,
      }))
    );
  };

  return (
    <header
      className="navbar"
      ref={navbarRef}
    >
      {/* LEFT */}
      <div className="navbar-title">
        <span className="navbar-page-indicator"></span>

        <div>
          <h2>{title}</h2>

          <p>
            Manage your finances with ease
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="navbar-actions">

        {/* Notification */}
        <div className="navbar-action-wrapper">

          <button
            type="button"
            className={`navbar-icon-btn ${
              showNotifications ? "active" : ""
            }`}
            onClick={handleNotificationClick}
            aria-label="Notifications"
          >
            <span className="notification-icon">
              🔔
            </span>

            {unreadCount > 0 && (
              <span className="notification-count">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">

              <div className="dropdown-header">
                <div>
                  <h3>Notifications</h3>

                  <span>
                    {unreadCount} unread
                  </span>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notification-list">

                {notifications.length === 0 ? (
                  <div className="empty-notifications">
                    <span>🔕</span>

                    <p>
                      No notifications
                    </p>
                  </div>
                ) : (
                  notifications.map(
                    (notification) => (
                      <div
                        className={`notification-item ${
                          notification.unread
                            ? "unread"
                            : ""
                        }`}
                        key={notification.id}
                      >
                        <div className="notification-item-icon">
                          {notification.icon}
                        </div>

                        <div className="notification-content">

                          <strong>
                            {notification.title}
                          </strong>

                          <p>
                            {notification.text}
                          </p>

                          <span>
                            {notification.time}
                          </span>

                        </div>

                        {notification.unread && (
                          <span className="unread-dot"></span>
                        )}
                      </div>
                    )
                  )
                )}

              </div>

              <div className="notification-footer">
                <button type="button">
                  View all notifications
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Divider */}
        <div className="navbar-divider"></div>

        {/* User */}
        <div className="navbar-user-wrapper">

          <button
            type="button"
            className={`navbar-user ${
              showProfile ? "active" : ""
            }`}
            onClick={handleProfileClick}
          >

            <div className="user-avatar">
              {avatarLetter}
            </div>

            <div className="user-info">

              <strong>
                {userName}
              </strong>

              <span>
                {userEmail}
              </span>

            </div>

            <span className="profile-arrow">
              {showProfile ? "▲" : "▼"}
            </span>

          </button>

          {showProfile && (
            <div className="profile-dropdown">

              <div className="profile-dropdown-top">

                <div className="profile-large-avatar">
                  {avatarLetter}
                </div>

                <div>

                  <strong>
                    {userName}
                  </strong>

                  <span>
                    {userEmail}
                  </span>

                </div>

              </div>

              <div className="profile-dropdown-divider"></div>

              {/* Profile */}
              <button
                type="button"
                className="profile-menu-item"
              >
                <span>👤</span>

                <div>
                  <strong>
                    Profile
                  </strong>

                  <small>
                    View your profile
                  </small>
                </div>
              </button>

              {/* Settings */}
              <button
                type="button"
                className="profile-menu-item"
              >
                <span>⚙️</span>

                <div>
                  <strong>
                    Settings
                  </strong>

                  <small>
                    Manage your account
                  </small>
                </div>
              </button>

              <div className="profile-dropdown-divider"></div>

              {/* Logout */}
              <button
                type="button"
                className="profile-logout"
                onClick={onLogout}
              >
                <span>↪</span>
                Logout
              </button>

            </div>
          )}

        </div>

      </div>
    </header>
  );
}

export default Navbar;