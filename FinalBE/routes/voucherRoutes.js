const express = require("express");
const router = express.Router();
const {
  createVoucher,
  getAllVouchers,
  getVoucherById,
  updateVoucher,
  deleteVoucher,
  applyVoucher,
} = require("../controllers/voucherController");
const { authMiddleware, authorize } = require("../middleware/auth");

// Tạo voucher mới
router.post("/",authMiddleware, authorize(["admin"]), createVoucher);

// Lấy danh sách tất cả voucher
router.get("/",authMiddleware, getAllVouchers);

// Lấy chi tiết một voucher
router.get("/:id",authMiddleware, getVoucherById);

// Cập nhật voucher
router.put("/:id",authMiddleware, authorize(["admin"]), updateVoucher);

// Xóa voucher
router.delete("/:id",authMiddleware, authorize(["admin"]), deleteVoucher);

// Kiểm tra & áp dụng voucher
router.post("/apply", applyVoucher);

module.exports = router;