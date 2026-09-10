import React from "react";

function Sidebar({
  activePage,
  setActivePage,
  onLogout,
}) {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "⌂",
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: "↔",
    },
    {
      id: "categories",
      label: "Categories",
      icon: "#",
    },
    {
      id: "reports",
      label: "Reports",
      icon: "▥",
    },
    {
      id: "settings",
      label: "Settings",
      icon: "⚙",
    },
  ];

  return (
    <aside className="sidebar">

      {/* LOGO */}

      <div className="sidebar-logo">

        <div className="logo-icon">
          ₹
        </div>

        <div>
          <h2>Expense</h2>
          <span>Tracker</span>
        </div>

      </div>


      {/* NAVIGATION */}

      <nav className="sidebar-nav">

        {menuItems.map((item) => (

          <button
            key={item.id}

            className={
              activePage === item.id
                ? "sidebar-item active"
                : "sidebar-item"
            }

            onClick={() =>
              setActivePage(item.id)
            }
          >

            <span className="sidebar-icon">
              {item.icon}
            </span>

            <span>
              {item.label}
            </span>

          </button>

        ))}

      </nav>


      {/* LOGOUT */}

      <div className="sidebar-bottom">

        <button
          className="sidebar-logout"
          onClick={onLogout}
        >

          <span>
            ↪
          </span>

          Logout

        </button>

      </div>

    </aside>
  );
}

export default Sidebar;

