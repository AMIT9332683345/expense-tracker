const Category = require("../models/Category");

// CREATE CATEGORY
const createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: "Category name and type are required"
      });
    }

    const category = await Category.create({
      userId: req.userId,
      name,
      type
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET ALL CATEGORIES
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      userId: req.userId
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// UPDATE CATEGORY
const updateCategory = async (req, res) => {
  try {
    const { name, type } = req.body;

    const category = await Category.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId
      },
      {
        name,
        type
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.json({
      success: true,
      message: "Category updated successfully",
      category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// DELETE CATEGORY
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
};