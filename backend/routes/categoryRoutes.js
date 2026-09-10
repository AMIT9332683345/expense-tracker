const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
} = require("../controllers/categoryController");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createCategory);
router.get("/", getCategories);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;