const Transaction = require("../models/Transaction");
const Category = require("../models/category");

// ========================================
// CREATE TRANSACTION
// ========================================
const createTransaction = async (req, res) => {
  try {
    const {
      categoryId,
      type,
      amount,
      date,
      paymentMethod,
      note
    } = req.body || {};

    // Validation
    if (!type || !amount || !date) {
      return res.status(400).json({
        success: false,
        message: "Type, amount and date are required"
      });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be income or expense"
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0"
      });
    }

    // Check category belongs to current user
    if (categoryId) {
      const category = await Category.findOne({
        _id: categoryId,
        userId: req.userId
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found"
        });
      }

      if (category.type !== type) {
        return res.status(400).json({
          success: false,
          message: "Category type does not match transaction type"
        });
      }
    }

    // Create transaction
    const transaction = await Transaction.create({
      userId: req.userId,
      categoryId: categoryId || null,
      type,
      amount: Number(amount),
      date,
      paymentMethod: paymentMethod || "cash",
      note: note || ""
    });

    // Return populated category
    const populatedTransaction =
      await Transaction.findById(transaction._id)
        .populate("categoryId", "name type");

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      transaction: populatedTransaction
    });

  } catch (error) {
    console.error("CREATE TRANSACTION ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ========================================
// GET ALL TRANSACTIONS
// ========================================
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.userId
    })
      .populate("categoryId", "name type")
      .sort({ date: -1, createdAt: -1 });

    res.json({
      success: true,
      count: transactions.length,
      transactions
    });

  } catch (error) {
    console.error("GET TRANSACTIONS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ========================================
// GET SINGLE TRANSACTION
// ========================================
const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.userId
    }).populate("categoryId", "name type");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }

    res.json({
      success: true,
      transaction
    });

  } catch (error) {
    console.error("GET TRANSACTION ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ========================================
// UPDATE TRANSACTION
// ========================================
const updateTransaction = async (req, res) => {
  try {
    const {
      categoryId,
      type,
      amount,
      date,
      paymentMethod,
      note
    } = req.body || {};

    // Find transaction belonging to user
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }

    // Validate type
    if (
      type &&
      !["income", "expense"].includes(type)
    ) {
      return res.status(400).json({
        success: false,
        message: "Type must be income or expense"
      });
    }

    // Validate amount
    if (amount !== undefined && Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0"
      });
    }

    // Determine final type
    const finalType = type || transaction.type;

    // Check category
    if (categoryId) {
      const category = await Category.findOne({
        _id: categoryId,
        userId: req.userId
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found"
        });
      }

      if (category.type !== finalType) {
        return res.status(400).json({
          success: false,
          message: "Category type does not match transaction type"
        });
      }
    }

    // Update
    transaction.categoryId =
      categoryId !== undefined
        ? categoryId
        : transaction.categoryId;

    transaction.type = finalType;

    transaction.amount =
      amount !== undefined
        ? Number(amount)
        : transaction.amount;

    transaction.date =
      date !== undefined
        ? date
        : transaction.date;

    transaction.paymentMethod =
      paymentMethod !== undefined
        ? paymentMethod
        : transaction.paymentMethod;

    transaction.note =
      note !== undefined
        ? note
        : transaction.note;

    await transaction.save();

    const updatedTransaction =
      await Transaction.findById(transaction._id)
        .populate("categoryId", "name type");

    res.json({
      success: true,
      message: "Transaction updated successfully",
      transaction: updatedTransaction
    });

  } catch (error) {
    console.error("UPDATE TRANSACTION ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ========================================
// DELETE TRANSACTION
// ========================================
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }

    res.json({
      success: true,
      message: "Transaction deleted successfully"
    });

  } catch (error) {
    console.error("DELETE TRANSACTION ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction
};
