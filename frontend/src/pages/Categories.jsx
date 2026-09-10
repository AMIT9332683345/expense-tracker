import "./Categories.css";
import React, { useEffect, useState } from "react";
import {
  getCategories,
  createCategory,
} from "../services/api";

function Categories() {
  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");
  const [type, setType] = useState("expense");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCategories();

      if (!data.success) {
        throw new Error(
          data.message || "Unable to load categories"
        );
      }

      setCategories(data.categories || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!name.trim()) {
      setError("Please enter a category name.");
      return;
    }

    try {
      setSaving(true);

      const data = await createCategory(
        name.trim(),
        type
      );

      if (!data.success) {
        throw new Error(
          data.message || "Unable to create category"
        );
      }

      setMessage(
        `${name.trim()} category created successfully.`
      );

      setName("");

      await loadCategories();

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="categories-page">

      <div className="page-header">
        <div>
          <h1>Categories</h1>
          <p>
            Manage your income and expense categories.
          </p>
        </div>
      </div>


      {/* ADD CATEGORY */}

      <div className="category-form-card">

        <h2>Add Category</h2>

        <p>
          Create a category for your transactions.
        </p>


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

          <div className="form-group">

            <label>
              Category Name
            </label>

            <input
              type="text"
              placeholder="Example: Food"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
            />

          </div>


          <div className="form-group">

            <label>
              Category Type
            </label>

            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value)
              }
            >
              <option value="expense">
                Expense
              </option>

              <option value="income">
                Income
              </option>
            </select>

          </div>


          <button
            type="submit"
            className="submit-transaction"
            disabled={saving}
          >
            {saving
              ? "Creating..."
              : "Create Category"}
          </button>

        </form>

      </div>


      {/* CATEGORY LIST */}

      <div className="categories-list-card">

        <div className="list-header">

          <div>
            <h2>Your Categories</h2>

            <p>
              Categories available for transactions.
            </p>
          </div>

          <button
            type="button"
            onClick={loadCategories}
            className="refresh-button"
          >
            ↻ Refresh
          </button>

        </div>


        {loading ? (
          <div className="empty-state">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (

          <div className="empty-state">
            No categories yet.
          </div>

        ) : (

          <div className="category-grid">

            {categories.map((category) => (

              <div
                className="category-item"
                key={category._id}
              >

                <div>
                  <h3>
                    {category.name}
                  </h3>

                  <span
                    className={
                      category.type === "income"
                        ? "income-badge"
                        : "expense-badge"
                    }
                  >
                    {category.type}
                  </span>
                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default Categories;