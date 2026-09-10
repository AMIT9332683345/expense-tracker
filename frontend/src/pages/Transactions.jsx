import "./Transaction.css";
import React, { useEffect, useState } from "react";

import {
  getCategories,
  createTransaction,
} from "../services/api";

function TransactionForm({ onSuccess }) {
  const [type, setType] = useState("expense");

  const [categories, setCategories] = useState([]);

  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [paymentMethod, setPaymentMethod] =
    useState("cash");

  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");


  // ========================================
  // LOAD CATEGORIES
  // ========================================

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      setError("");

      const data = await getCategories();

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to load categories"
        );
      }

      setCategories(data.categories || []);

    } catch (err) {
      setError(err.message);

    } finally {
      setLoadingCategories(false);
    }
  };


  useEffect(() => {
    loadCategories();
  }, []);


  // ========================================
  // FILTER CATEGORY BY TYPE
  // ========================================

  const filteredCategories =
    categories.filter(
      (category) =>
        category.type === type
    );


  useEffect(() => {
    setCategoryId("");
  }, [type]);


  // ========================================
  // SUBMIT TRANSACTION
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");


    if (!categoryId) {
      setError(
        "Please select a category."
      );
      return;
    }


    if (
      !amount ||
      Number(amount) <= 0
    ) {
      setError(
        "Please enter a valid amount."
      );
      return;
    }


    try {
      setLoading(true);


      const transaction = {
        categoryId: categoryId,
        type: type,
        amount: Number(amount),
        date: date,
        paymentMethod: paymentMethod,
        note: note,
      };


      console.log(
        "CREATING TRANSACTION:",
        transaction
      );


      const data =
        await createTransaction(
          transaction
        );


      console.log(
        "TRANSACTION RESPONSE:",
        data
      );


      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to create transaction"
        );
      }


      setMessage(
        `${
          type === "income"
            ? "Income"
            : "Expense"
        } added successfully.`
      );


      setAmount("");
      setNote("");
      setCategoryId("");


      if (onSuccess) {
        onSuccess(data);
      }

    } catch (err) {

      console.error(
        "TRANSACTION ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to create transaction"
      );

    } finally {
      setLoading(false);
    }
  };


  // ========================================
  // UI
  // ========================================

  return (
    <div className="transaction-form-card">

      <div className="form-header">

        <div>

          <h2>
            Add Transaction
          </h2>

          <p>
            Record your income or expense.
          </p>

        </div>

      </div>


      {error && (
        <div className="form-error">
          {error}
        </div>
      )}


      {message && (
        <div className="form-success">
          {message}
        </div>
      )}


      <form onSubmit={handleSubmit}>

        {/* TYPE */}

        <div className="type-selector">

          <button
            type="button"
            className={
              type === "expense"
                ? "type-button active-expense"
                : "type-button"
            }
            onClick={() =>
              setType("expense")
            }
          >
            ↘ Expense
          </button>


          <button
            type="button"
            className={
              type === "income"
                ? "type-button active-income"
                : "type-button"
            }
            onClick={() =>
              setType("income")
            }
          >
            ↗ Income
          </button>

        </div>


        {/* CATEGORY */}

        <div className="form-group">

          <label>
            Category
          </label>

          <select
            value={categoryId}
            onChange={(e) =>
              setCategoryId(
                e.target.value
              )
            }
            disabled={
              loadingCategories
            }
            required
          >

            <option value="">
              {loadingCategories
                ? "Loading categories..."
                : "Select category"}
            </option>


            {filteredCategories.map(
              (category) => (
                <option
                  key={category._id}
                  value={category._id}
                >
                  {category.name}
                </option>
              )
            )}

          </select>


          {!loadingCategories &&
            filteredCategories.length ===
              0 && (
              <small className="form-help">
                No {type} categories found.
              </small>
            )}

        </div>


        {/* AMOUNT + DATE */}

        <div className="form-row">

          <div className="form-group">

            <label>
              Amount
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) =>
                setAmount(
                  e.target.value
                )
              }
              required
            />

          </div>


          <div className="form-group">

            <label>
              Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(
                  e.target.value
                )
              }
              required
            />

          </div>

        </div>


        {/* PAYMENT METHOD */}

        <div className="form-group">

          <label>
            Payment Method
          </label>

          <select
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(
                e.target.value
              )
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

        </div>


        {/* NOTE */}

        <div className="form-group">

          <label>
            Note
          </label>

          <textarea
            placeholder="Optional note"
            value={note}
            onChange={(e) =>
              setNote(
                e.target.value
              )
            }
            rows="3"
          />

        </div>


        {/* SUBMIT */}

        <button
          type="submit"
          className="submit-transaction"
          disabled={loading}
        >

          {loading
            ? "Saving..."
            : `Add ${
                type === "income"
                  ? "Income"
                  : "Expense"
              }`}

        </button>

      </form>

    </div>
  );
}

export default TransactionForm;