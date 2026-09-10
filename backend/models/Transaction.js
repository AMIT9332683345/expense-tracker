const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null
    },

    type: {
      type: String,
      enum: ["income", "expense"],
      required: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    date: {
      type: Date,
      required: true
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "card", "bank", "other"],
      default: "cash"
    },

    note: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);