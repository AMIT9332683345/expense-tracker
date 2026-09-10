const Transaction = require("../models/Transaction");

// ========================================
// GET DASHBOARD SUMMARY
// ========================================
const getDashboard = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all transactions of logged-in user
    const transactions = await Transaction.find({
      userId
    })
      .populate("categoryId", "name type")
      .sort({
        date: -1,
        createdAt: -1
      });

    // Calculate totals
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((transaction) => {
      const amount = Number(transaction.amount);

      if (transaction.type === "income") {
        totalIncome += amount;
      }

      if (transaction.type === "expense") {
        totalExpense += amount;
      }
    });

    // Calculate balance
    const balance = totalIncome - totalExpense;

    // Recent 5 transactions
    const recentTransactions = transactions.slice(0, 5);

    res.json({
      success: true,

      summary: {
        totalIncome,
        totalExpense,
        balance,
        totalTransactions: transactions.length
      },

      recentTransactions
    });

  } catch (error) {
    console.error("DASHBOARD ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  getDashboard
};