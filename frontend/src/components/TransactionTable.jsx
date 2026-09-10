import React, { useEffect, useMemo, useState } from "react";
import {
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getCategories,
} from "../services/api";

import "./TransactionTable.css";

function TransactionTable() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // ========================================
  // LOAD TRANSACTIONS
  // ========================================

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTransactions();

      if (!data.success) {
        throw new Error(
          data.message || "Unable to load transactions"
        );
      }

      setTransactions(data.transactions || []);
    } catch (err) {
      setError(
        err.message || "Unable to load transactions"
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOAD CATEGORIES
  // ========================================

  const loadCategories = async () => {
    try {
      const data = await getCategories();

      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("CATEGORY LOAD ERROR:", err);
    }
  };

  useEffect(() => {
    loadTransactions();
    loadCategories();
  }, []);

  // ========================================
  // FILTER TRANSACTIONS
  // ========================================

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const categoryName =
        transaction.categoryId?.name || "";

      const note =
        transaction.note || "";

      const searchText =
        `${categoryName} ${note}`.toLowerCase();

      const matchesSearch =
        searchText.includes(
          search.toLowerCase()
        );

      const matchesType =
        typeFilter === "all" ||
        transaction.type === typeFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        transaction.categoryId?._id ===
          categoryFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesCategory
      );
    });
  }, [
    transactions,
    search,
    typeFilter,
    categoryFilter,
  ]);

  // ========================================
  // START EDIT
  // ========================================

  const handleEdit = (transaction) => {
    setEditingId(transaction._id);

    setEditData({
      categoryId:
        transaction.categoryId?._id || "",
      type: transaction.type,
      amount: transaction.amount,
      date: transaction.date
        ? transaction.date.split("T")[0]
        : "",
      paymentMethod:
        transaction.paymentMethod || "cash",
      note: transaction.note || "",
    });
  };

  // ========================================
  // CANCEL EDIT
  // ========================================

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  // ========================================
  // SAVE EDIT
  // ========================================

  const handleSaveEdit = async (id) => {
    try {
      if (
        !editData.categoryId ||
        !editData.amount ||
        Number(editData.amount) <= 0
      ) {
        alert(
          "Please enter a valid category and amount."
        );
        return;
      }

      const updatedTransaction = {
        categoryId: editData.categoryId,
        type: editData.type,
        amount: Number(editData.amount),
        date: editData.date,
        paymentMethod:
          editData.paymentMethod,
        note: editData.note,
      };

      const data =
        await updateTransaction(
          id,
          updatedTransaction
        );

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to update transaction"
        );
      }

      setEditingId(null);
      setEditData({});

      await loadTransactions();
    } catch (err) {
      alert(
        err.message ||
          "Unable to update transaction"
      );
    }
  };

  // ========================================
  // DELETE
  // ========================================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const data =
        await deleteTransaction(id);

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to delete transaction"
        );
      }

      setTransactions((prev) =>
        prev.filter(
          (transaction) =>
            transaction._id !== id
        )
      );
    } catch (err) {
      alert(
        err.message ||
          "Unable to delete transaction"
      );
    }
  };

  // ========================================
  // EDIT CATEGORY FILTER
  // ========================================

  const editCategories =
    categories.filter(
      (category) =>
        !editData.type ||
        category.type === editData.type
    );

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="transaction-table-card">
        <div className="transaction-loading">
          <div className="loading-spinner"></div>
          <p>Loading transactions...</p>
        </div>
      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error) {
    return (
      <div className="transaction-table-card">
        <div className="transaction-error">
          <h3>Unable to load transactions</h3>

          <p>{error}</p>

          <button
            onClick={loadTransactions}
            className="retry-btn"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // UI
  // ========================================

  return (
    <div className="transaction-table-card">

      {/* HEADER */}

      <div className="transaction-table-header">

        <div>
          <h2>All Transactions</h2>

          <p>
            Manage your income and expenses
          </p>
        </div>

        <button
          className="table-refresh-btn"
          onClick={loadTransactions}
        >
          ↻ Refresh
        </button>

      </div>


      {/* FILTERS */}

      <div className="transaction-filters">

        {/* SEARCH */}

        <div className="transaction-search">

          <span>⌕</span>

          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>


        {/* TYPE */}

        <select
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value)
          }
        >
          <option value="all">
            All Types
          </option>

          <option value="income">
            Income
          </option>

          <option value="expense">
            Expense
          </option>
        </select>


        {/* CATEGORY */}

        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value)
          }
        >
          <option value="all">
            All Categories
          </option>

          {categories.map((category) => (
            <option
              key={category._id}
              value={category._id}
            >
              {category.name}
            </option>
          ))}

        </select>

      </div>


      {/* RESULT COUNT */}

      <div className="transaction-result-info">
        Showing{" "}
        <strong>
          {filteredTransactions.length}
        </strong>{" "}
        of{" "}
        <strong>
          {transactions.length}
        </strong>{" "}
        transactions
      </div>


      {/* EMPTY */}

      {filteredTransactions.length === 0 ? (

        <div className="transaction-empty">

          <div className="empty-transaction-icon">
            ₹
          </div>

          <h3>
            No transactions found
          </h3>

          <p>
            {transactions.length === 0
              ? "Your transactions will appear here."
              : "Try changing your search or filters."}
          </p>

        </div>

      ) : (

        <div className="transaction-table-wrapper">

          <table className="transaction-table">

            <thead>

              <tr>

                <th>Date</th>

                <th>Category</th>

                <th>Type</th>

                <th>Amount</th>

                <th>Payment</th>

                <th>Note</th>

                <th>Actions</th>

              </tr>

            </thead>


            <tbody>

              {filteredTransactions.map(
                (transaction) => {

                  const isEditing =
                    editingId ===
                    transaction._id;

                  return (

                    <tr
                      key={transaction._id}
                      className={
                        isEditing
                          ? "editing-row"
                          : ""
                      }
                    >

                      {/* DATE */}

                      <td>

                        {isEditing ? (

                          <input
                            className="edit-input"
                            type="date"
                            value={
                              editData.date
                            }
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                date:
                                  e.target.value,
                              })
                            }
                          />

                        ) : (

                          new Date(
                            transaction.date
                          ).toLocaleDateString(
                            "en-IN"
                          )

                        )}

                      </td>


                      {/* CATEGORY */}

                      <td>

                        {isEditing ? (

                          <select
                            className="edit-input"
                            value={
                              editData.categoryId
                            }
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                categoryId:
                                  e.target.value,
                              })
                            }
                          >

                            <option value="">
                              Select category
                            </option>

                            {editCategories.map(
                              (category) => (
                                <option
                                  key={
                                    category._id
                                  }
                                  value={
                                    category._id
                                  }
                                >
                                  {category.name}
                                </option>
                              )
                            )}

                          </select>

                        ) : (

                          <div className="category-cell">

                            <span className="category-dot"></span>

                            {transaction
                              .categoryId
                              ?.name ||
                              "Unknown"}

                          </div>

                        )}

                      </td>


                      {/* TYPE */}

                      <td>

                        {isEditing ? (

                          <select
                            className="edit-input"
                            value={
                              editData.type
                            }
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                type:
                                  e.target.value,
                                categoryId: "",
                              })
                            }
                          >

                            <option value="expense">
                              Expense
                            </option>

                            <option value="income">
                              Income
                            </option>

                          </select>

                        ) : (

                          <span
                            className={
                              transaction.type ===
                              "income"
                                ? "type-badge income-badge"
                                : "type-badge expense-badge"
                            }
                          >

                            {transaction.type ===
                            "income"
                              ? "↗ Income"
                              : "↘ Expense"}

                          </span>

                        )}

                      </td>


                      {/* AMOUNT */}

                      <td>

                        {isEditing ? (

                          <input
                            className="edit-input"
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              editData.amount
                            }
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                amount:
                                  e.target.value,
                              })
                            }
                          />

                        ) : (

                          <strong
                            className={
                              transaction.type ===
                              "income"
                                ? "amount-income"
                                : "amount-expense"
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

                        )}

                      </td>


                      {/* PAYMENT */}

                      <td>

                        {isEditing ? (

                          <select
                            className="edit-input"
                            value={
                              editData.paymentMethod
                            }
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                paymentMethod:
                                  e.target.value,
                              })
                            }
                          >

                            <option value="cash">
                              Cash
                            </option>

                            <option value="upi">
                              UPI
                            </option>

                            <option value="bank">
                              Bank
                            </option>

                            <option value="card">
                              Card
                            </option>

                            <option value="other">
                              Other
                            </option>

                          </select>

                        ) : (

                          <span className="payment-badge">

                            {transaction
                              .paymentMethod ||
                              "Other"}

                          </span>

                        )}

                      </td>


                      {/* NOTE */}

                      <td>

                        {isEditing ? (

                          <input
                            className="edit-input"
                            type="text"
                            value={
                              editData.note
                            }
                            placeholder="Note"
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                note:
                                  e.target.value,
                              })
                            }
                          />

                        ) : (

                          <span className="note-cell">

                            {transaction.note ||
                              "—"}

                          </span>

                        )}

                      </td>


                      {/* ACTIONS */}

                      <td>

                        {isEditing ? (

                          <div className="action-buttons">

                            <button
                              className="save-btn"
                              onClick={() =>
                                handleSaveEdit(
                                  transaction._id
                                )
                              }
                            >
                              ✓ Save
                            </button>

                            <button
                              className="cancel-btn"
                              onClick={
                                handleCancelEdit
                              }
                            >
                              ✕ Cancel
                            </button>

                          </div>

                        ) : (

                          <div className="action-buttons">

                            <button
                              className="edit-btn"
                              onClick={() =>
                                handleEdit(
                                  transaction
                                )
                              }
                              title="Edit"
                            >
                              ✎
                            </button>

                            <button
                              className="delete-btn"
                              onClick={() =>
                                handleDelete(
                                  transaction._id
                                )
                              }
                              title="Delete"
                            >
                              🗑
                            </button>

                          </div>

                        )}

                      </td>

                    </tr>

                  );
                }
              )}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}

export default TransactionTable;