const express = require("express");
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { authMiddleware, authorize } = require("../middleware/auth");


// Tạo danh mục mới
router.post("/",authMiddleware, authorize(["admin"]), createCategory);

// Lấy tất cả danh mục
router.get("/", getAllCategories);

// Lấy danh mục theo ID
router.get("/:id", getCategoryById);

// Cập nhật danh mục theo ID
router.put("/:id",authMiddleware, authorize(["admin"]), updateCategory);

// Xóa danh mục theo ID
router.delete("/:id",authMiddleware, authorize(["admin"]), deleteCategory);

module.exports = router;