const express = require("express");
const router = express.Router();
const {
  getAllQuizzes,
  createQuizz,
  updateQuizz,
  deleteQuizz,
  submitQuizzAnswers,
} = require("../controllers/quizzController");
const { authMiddleware, authorize } = require("../middleware/auth");


// Lấy tất cả quiz
router.get("/", getAllQuizzes);

// Thêm một hoặc nhiều quiz
router.post("/",authMiddleware, authorize(["admin"]), createQuizz);

// Cập nhật một quiz
router.put("/:id",authMiddleware, authorize(["admin"]), updateQuizz);

// Xóa một quiz
router.delete("/:id",authMiddleware, authorize(["admin"]), deleteQuizz);

// Nhận câu trả lời từ người dùng
router.post("/submit",authMiddleware, submitQuizzAnswers);

module.exports = router;