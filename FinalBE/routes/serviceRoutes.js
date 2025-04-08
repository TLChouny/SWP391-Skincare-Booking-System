const express = require("express");
const router = express.Router();
const {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  addVoucherToService,
  removeVoucherFromService,
} = require("../controllers/serviceController");
const { authMiddleware, authorize } = require("../middleware/auth");

// Tạo dịch vụ mới
router.post("/",authMiddleware, authorize(["admin"]), createService);

// Lấy tất cả dịch vụ
router.get("/", getAllServices);

// Lấy dịch vụ theo ID
router.get("/:id", getServiceById);

// Cập nhật dịch vụ
router.put("/:id",authMiddleware, authorize(["admin"]), updateService);

// Xóa dịch vụ
router.delete("/:id",authMiddleware, authorize(["admin"]), deleteService);

// Thêm voucher vào dịch vụ
router.post("/:id/vouchers",authMiddleware, authorize(["admin"]), addVoucherToService);

// Xóa voucher khỏi dịch vụ
router.delete("/:id/vouchers/:voucherId",authMiddleware, authorize(["admin"]), removeVoucherFromService);

module.exports = router;