const express = require("express");
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getSkincareStaff,
  verifyEmail,
  submitAnswer, // Thêm route
  getUserResponses, // Thêm route
} = require("../controllers/userController");
const { authMiddleware, authorize } = require("../middleware/auth");

const router = express.Router();

// 📌 Xác thực email
router.get("/verify-email", verifyEmail);

// 📌 Gửi câu trả lời cho câu hỏi
router.post("/submit-answer", authMiddleware, submitAnswer);

// 📌 Lấy tất cả câu trả lời của một user
router.get("/responses/:userId?", authMiddleware, getUserResponses); // :userId là tùy chọn

// 📌 Lấy danh sách nhân viên có role "skincare_staff"
router.get("/skincare-staff", authMiddleware, getSkincareStaff);

// 📌 Lấy tất cả người dùng (Chỉ Admin)
router.get("/", authMiddleware, authorize(["admin"]), getAllUsers);

// 📌 Lấy thông tin người dùng theo ID
router.get("/:id", authMiddleware, getUserById);

// 📌 Tạo người dùng mới (Chỉ Admin)
router.post("/", authMiddleware, authorize(["admin"]), createUser);

// 📌 Cập nhật thông tin người dùng
router.put("/:id", authMiddleware, updateUser);

// 📌 Xóa người dùng (Chỉ Admin)
router.delete("/:id", authMiddleware, authorize(["admin"]), deleteUser);

module.exports = router;