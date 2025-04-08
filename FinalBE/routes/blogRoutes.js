const express = require("express");
const router = express.Router();
const {
  getAllBlogs,
  createBlog,
  getBlogById,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");
const { authMiddleware, authorize } = require("../middleware/auth");


// Lấy tất cả bài viết
router.get("/", getAllBlogs);

// Tạo bài viết mới
router.post("/",authMiddleware, authorize(["admin"]), createBlog);

// Lấy bài viết theo ID
router.get("/:_id", getBlogById);

// Cập nhật bài viết theo ID
router.put("/:_id",authMiddleware, authorize(["admin"]), updateBlog);

// Xóa bài viết theo ID
router.delete("/:_id",authMiddleware, authorize(["admin"]), deleteBlog);

module.exports = router;