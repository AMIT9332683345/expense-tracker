import "./Dashboard.css";
import React, { useEffect, useState } from "react";
import { getDashboard } from "../services/api";
import TransactionForm from "../components/TransactionForm";

function Dashboard({ onLogout }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDashboard();

      if (!data.success) {
        throw new Error(
          data.message || "Unable to load dashboard"
        );
      }

      setDashboard(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Unable to load dashboard</h2>

        <p>{error}</p>

        <button onClick={loadDashboard}>
          Try Again
        </button>
      </div>
    );
  }

  const summary = dashboard?.summary || {};

  const totalIncome =
    Number(summary.totalIncome || 0);

  const totalExpense =
    Number(summary.totalExpense || 0);

  const balance =
    Number(summary.balance || 0);

  const totalTransactions =
    Number(summary.totalTransactions || 0);

  const recentTransactions =
    dashboard?.recentTransactions || [];


  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <div className="dashboard-header">

        <div>
          <h1>Dashboard</h1>

          <p>
            Here's what's happening with your
            money today.
          </p>
        </div>


        <div className="dashboard-actions">

          <button
            className="refresh-btn"
            onClick={loadDashboard}
          >
            ↻ Refresh
          </button>


          <button
            className="quick-add-btn"
            onClick={() =>
              setShowForm(!showForm)
            }
          >
            {showForm
              ? "✕ Close"
              : "+ Add Transaction"}
          </button>


          <button
            className="logout-btn"
            onClick={onLogout}
          >
            Logout
          </button>

        </div>

      </div>


      {/* QUICK ADD FORM */}

      {showForm && (
        <div className="dashboard-form-wrapper">

          <TransactionForm
            onSuccess={() => {
              setShowForm(false);
              loadDashboard();
            }}
          />

        </div>
      )}


      {/* SUMMARY CARDS */}

      <div className="summary-grid">

        <div className="summary-card balance-card">

          <div className="card-icon">
            ₹
          </div>

          <div>
            <p>Total Balance</p>

            <h2>
              ₹
              {balance.toLocaleString(
                "en-IN"
              )}
            </h2>
          </div>

        </div>


        <div className="summary-card income-card">

          <div className="card-icon">
            ↗
          </div>

          <div>
            <p>Total Income</p>

            <h2>
              ₹
              {totalIncome.toLocaleString(
                "en-IN"
              )}
            </h2>
          </div>

        </div>


        <div className="summary-card expense-card">

          <div className="card-icon">
            ↘
          </div>

          <div>
            <p>Total Expense</p>

            <h2>
              ₹
              {totalExpense.toLocaleString(
                "en-IN"
              )}
            </h2>
          </div>

        </div>


        <div className="summary-card transaction-card">

          <div className="card-icon">
            #
          </div>

          <div>
            <p>Transactions</p>

            <h2>
              {totalTransactions}
            </h2>
          </div>

        </div>

      </div>


      {/* RECENT TRANSACTIONS */}

      <div className="recent-section">

        <div className="section-header">

          <div>

            <h2>
              Recent Transactions
            </h2>

            <p>
              Your latest income and expenses
            </p>

          </div>

        </div>


        {recentTransactions.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              ₹
            </div>

            <h3>
              No transactions yet
            </h3>

            <p>
              Add your first income or
              expense to see it here.
            </p>

          </div>

        ) : (

          <div className="transaction-list">

            {recentTransactions.map(
              (transaction) => (

                <div
                  className="transaction-item"
                  key={transaction._id}
                >

                  <div className="transaction-left">

                    <div
                      className={
                        transaction.type ===
                        "income"
                          ? "transaction-icon income"
                          : "transaction-icon expense"
                      }
                    >
                      {transaction.type ===
                      "income"
                        ? "↗"
                        : "↘"}
                    </div>


                    <div>

                      <h3>
                        {transaction
                          .categoryId
                          ?.name ||
                          "Unknown"}
                      </h3>

                      <p>
                        {transaction.note ||
                          "No note"}
                      </p>

                    </div>

                  </div>


                  <div className="transaction-right">

                    <strong
                      className={
                        transaction.type ===
                        "income"
                          ? "income-text"
                          : "expense-text"
                      }
                    >

                      {transaction.type ===
                      "income"
                        ? "+"
                        : "-"}

                      ₹
                      {Number(
                        transaction.amount
                      ).toLocaleString(
                        "en-IN"
                      )}

                    </strong>


                    <span>
                      {new Date(
                        transaction.date
                      ).toLocaleDateString(
                        "en-IN"
                      )}
                    </span>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default Dashboard;

