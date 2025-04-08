const Voucher = require("../models/Voucher");

// Tạo voucher mới
const createVoucher = async (req, res) => {
  try {
    const { code, discountPercentage, expiryDate } = req.body;

    if (
      !discountPercentage ||
      discountPercentage <= 0 ||
      discountPercentage > 100
    ) {
      return res.status(400).json({
        message: "Phần trăm giảm giá phải lớn hơn 0 và nhỏ hơn 100",
      });
    }

    const newVoucher = new Voucher({
      code,
      discountPercentage,
      expiryDate,
    });

    await newVoucher.save();
    res.status(201).json(newVoucher);
  } catch (error) {
    console.error("Error creating voucher:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách tất cả voucher
const getAllVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find();
    res.json(vouchers);
  } catch (error) {
    console.error("Error fetching vouchers:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Lấy chi tiết một voucher
const getVoucherById = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ message: "Voucher không tồn tại" });
    }
    res.json(voucher);
  } catch (error) {
    console.error("Error fetching voucher:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật voucher
const updateVoucher = async (req, res) => {
  try {
    const {
      code,
      discountPercentage,
      minOrderValue,
      maxDiscount,
      expiryDate,
      isActive,
    } = req.body;

    const updatedVoucher = await Voucher.findByIdAndUpdate(
      req.params.id,
      {
        code,
        discountPercentage,
        minOrderValue,
        maxDiscount,
        expiryDate,
        isActive,
      },
      { new: true }
    );

    if (!updatedVoucher) {
      return res.status(404).json({ message: "Voucher không tồn tại" });
    }

    res.json(updatedVoucher);
  } catch (error) {
    console.error("Error updating voucher:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Xóa voucher
const deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndDelete(req.params.id);
    if (!voucher) {
      return res.status(404).json({ message: "Voucher không tồn tại" });
    }
    res.json({ message: "Voucher đã được xóa" });
  } catch (error) {
    console.error("Error deleting voucher:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Kiểm tra & áp dụng voucher
const applyVoucher = async (req, res) => {
  try {
    const { code, orderValue } = req.body;

    if (!code || !orderValue || orderValue < 0) {
      return res.status(400).json({
        message: "Mã voucher và giá trị đơn hàng là bắt buộc và phải hợp lệ",
      });
    }

    const voucher = await Voucher.findOne({ code, isActive: true });
    if (!voucher) {
      return res.status(400).json({
        message: "Voucher không hợp lệ hoặc đã bị vô hiệu hóa",
      });
    }

    if (new Date(voucher.expiryDate) < new Date()) {
      return res.status(400).json({ message: "Voucher đã hết hạn" });
    }

    let discountAmount = (orderValue * voucher.discountPercentage) / 100;
    if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
      discountAmount = voucher.maxDiscount;
    }
    if (voucher.minOrderValue && orderValue < voucher.minOrderValue) {
      return res.status(400).json({
        message: `Đơn hàng phải có giá trị tối thiểu ${voucher.minOrderValue} để áp dụng voucher này`,
      });
    }

    res.json({
      success: true,
      discount: discountAmount,
      finalPrice: orderValue - discountAmount,
    });
  } catch (error) {
    console.error("Error applying voucher:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createVoucher,
  getAllVouchers,
  getVoucherById,
  updateVoucher,
  deleteVoucher,
  applyVoucher,
};