import "./Reports.css";
import React, { useEffect, useState } from "react";
import { getDashboard } from "../services/api";

function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getDashboard();

      if (!response.success) {
        throw new Error(
          response.message || "Unable to load reports"
        );
      }

      setData(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        Loading reports...
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        <h2>Unable to load reports</h2>
        <p>{error}</p>

        <button onClick={loadReport}>
          Try Again
        </button>
      </div>
    );
  }

  const summary = data?.summary || {};
  const recentTransactions =
    data?.recentTransactions || [];

  const income = Number(summary.totalIncome || 0);
  const expense = Number(summary.totalExpense || 0);
  const balance = Number(summary.balance || 0);
  const transactions =
    Number(summary.totalTransactions || 0);

  const totalMoney = income + expense;

  const incomePercentage =
    totalMoney > 0
      ? Math.round((income / totalMoney) * 100)
      : 0;

  const expensePercentage =
    totalMoney > 0
      ? Math.round((expense / totalMoney) * 100)
      : 0;

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString(
      "en-IN"
    );
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="reports-page">

      {/* HEADER */}

      <div className="page-header">

        <div>
          <h1>Reports</h1>

          <p>
            Overview of your financial activity.
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={loadReport}
        >
          ↻ Refresh
        </button>

      </div>


      {/* SUMMARY CARDS */}

      <div className="report-grid">

        <div className="report-card">
          <p>Total Income</p>

          <h2>
            ₹{formatAmount(income)}
          </h2>

          <span className="income-text">
            Money received
          </span>
        </div>


        <div className="report-card">
          <p>Total Expense</p>

          <h2>
            ₹{formatAmount(expense)}
          </h2>

          <span className="expense-text">
            Money spent
          </span>
        </div>


        <div className="report-card">
          <p>Balance</p>

          <h2>
            ₹{formatAmount(balance)}
          </h2>

          <span>
            Current balance
          </span>
        </div>


        <div className="report-card">
          <p>Transactions</p>

          <h2>{transactions}</h2>

          <span>
            Total transactions
          </span>
        </div>

      </div>


      {/* INCOME VS EXPENSE */}

      <div className="report-overview">

        <h2>Income vs Expense</h2>

        <p>
          Compare your total money received and spent.
        </p>


        <div className="overview-row">

          <div className="overview-label">

            <span>Income</span>

            <strong>
              ₹{formatAmount(income)}
            </strong>

          </div>


          <div className="progress-container">

            <div
              className="progress income-progress"
              style={{
                width: `${incomePercentage}%`,
              }}
            />

          </div>

          <span className="percentage">
            {incomePercentage}%
          </span>

        </div>


        <div className="overview-row">

          <div className="overview-label">

            <span>Expense</span>

            <strong>
              ₹{formatAmount(expense)}
            </strong>

          </div>


          <div className="progress-container">

            <div
              className="progress expense-progress"
              style={{
                width: `${expensePercentage}%`,
              }}
            />

          </div>

          <span className="percentage">
            {expensePercentage}%
          </span>

        </div>

      </div>


      {/* BALANCE STATUS */}

      <div className="balance-report-card">

        <div>
          <h2>Financial Status</h2>

          <p>
            Your current financial position.
          </p>
        </div>


        <div className="balance-status">

          {balance > 0 ? (
            <>
              <span className="status-positive">
                Positive Balance
              </span>

              <strong>
                ₹{formatAmount(balance)}
              </strong>
            </>
          ) : balance < 0 ? (
            <>
              <span className="status-negative">
                Negative Balance
              </span>

              <strong>
                ₹{formatAmount(Math.abs(balance))}
              </strong>
            </>
          ) : (
            <>
              <span className="status-neutral">
                No Balance
              </span>

              <strong>₹0</strong>
            </>
          )}

        </div>

      </div>


      {/* RECENT TRANSACTIONS */}

      <div className="report-transactions">

        <div className="list-header">

          <div>
            <h2>Recent Transactions</h2>

            <p>
              Latest income and expenses.
            </p>
          </div>

        </div>


        {recentTransactions.length === 0 ? (

          <div className="empty-state">
            No transactions available.
          </div>

        ) : (

          <div className="report-transaction-list">

            {recentTransactions.map(
              (transaction) => (

                <div
                  className="report-transaction"
                  key={transaction._id}
                >

                  <div>

                    <strong>
                      {transaction.categoryId?.name ||
                        "Unknown"}
                    </strong>

                    <span>
                      {formatDate(
                        transaction.date
                      )}{" "}
                      •{" "}
                      {transaction.paymentMethod ||
                        "Other"}
                    </span>

                  </div>


                  <div
                    className={
                      transaction.type ===
                      "income"
                        ? "income-amount"
                        : "expense-amount"
                    }
                  >

                    {transaction.type ===
                    "income"
                      ? "+"
                      : "-"}
                    ₹
                    {formatAmount(
                      transaction.amount
                    )}

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

export default Reports;

