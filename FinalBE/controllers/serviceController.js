const { check, validationResult } = require("express-validator");
const Service = require("../models/Service");
const Category = require("../models/Category");
const Voucher = require("../models/Voucher");

// Tạo dịch vụ mới
const createService = [
  check("name", "Tên dịch vụ không được để trống").not().isEmpty(),
  check("price", "Giá dịch vụ phải là số hợp lệ").isNumeric(),
  check("duration", "Thời gian phải là số nguyên").isInt(),
  check("category", "ID danh mục không hợp lệ").isMongoId(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let { name, description, price, duration, category, image, vouchers } = req.body;

    if (typeof price === "string") {
      price = price.replace(/\./g, "");
      price = parseFloat(price);
    }

    if (isNaN(price)) {
      return res.status(400).json({ msg: "Giá dịch vụ không hợp lệ" });
    }

    try {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ msg: "Danh mục không tồn tại" });
      }

      if (vouchers && Array.isArray(vouchers)) {
        const validVouchers = await Voucher.find({ _id: { $in: vouchers } });
        if (validVouchers.length !== vouchers.length) {
          return res.status(400).json({ msg: "Một hoặc nhiều voucher không tồn tại" });
        }
      }

      const lastService = await Service.findOne().sort({ service_id: -1 });
      const newServiceId = lastService ? lastService.service_id + 1 : 1;

      const service = new Service({
        service_id: newServiceId,
        name,
        description,
        price,
        duration,
        category,
        image: image || "",
        vouchers: vouchers || [],
      });

      await service.save();
      res.status(201).json(service);
    } catch (err) {
      console.error("Error creating service:", err.message);
      res.status(500).json({ message: "Lỗi máy chủ" });
    }
  },
];

// Lấy tất cả dịch vụ
const getAllServices = async (req, res) => {
  try {
    const services = await Service.find()
      .populate("category", "name description")
      .populate("vouchers", "code discountPercentage expiryDate isActive");

    const servicesWithDiscount = services.map((service) => {
      const price = service.price;
      const vouchers = service.vouchers || [];
      const highestDiscount =
        vouchers.length > 0
          ? Math.max(...vouchers.map((v) => v.discountPercentage || 0))
          : 0;
      const discountedPrice = price - (price * highestDiscount) / 100;

      return {
        ...service.toObject(),
        discountedPrice: vouchers.length > 0 ? discountedPrice : null,
      };
    });

    res.json(servicesWithDiscount);
  } catch (err) {
    console.error("Error fetching services:", err.message);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Lấy dịch vụ theo ID
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate("category", "name description")
      .populate("vouchers", "code discountPercentage expiryDate isActive");
    if (!service) {
      return res.status(404).json({ msg: "Dịch vụ không tồn tại" });
    }

    const price = service.price;
    const vouchers = service.vouchers || [];
    const highestDiscount =
      vouchers.length > 0
        ? Math.max(...vouchers.map((v) => v.discountPercentage || 0))
        : 0;
    const discountedPrice = price - (price * highestDiscount) / 100;

    res.json({
      ...service.toObject(),
      discountedPrice: vouchers.length > 0 ? discountedPrice : null,
    });
  } catch (err) {
    console.error("Error fetching service:", err.message);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Cập nhật dịch vụ
const updateService = async (req, res) => {
  const { name, description, price, duration, category, image, vouchers } = req.body;

  try {
    let service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ msg: "Dịch vụ không tồn tại" });
    }

    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ msg: "Danh mục không tồn tại" });
      }
    }

    if (vouchers !== undefined) {
      if (!Array.isArray(vouchers)) {
        return res.status(400).json({ msg: "Vouchers phải là một mảng" });
      }
      const validVouchers = await Voucher.find({ _id: { $in: vouchers } });
      if (validVouchers.length !== vouchers.length) {
        return res.status(400).json({ msg: "Một hoặc nhiều voucher không tồn tại" });
      }
      service.vouchers = vouchers;
    }

    service.name = name || service.name;
    service.description = description || service.description;
    service.price = price || service.price;
    service.duration = duration || service.duration;
    service.category = category || service.category;
    service.image = image || service.image;

    await service.save();
    res.json(service);
  } catch (err) {
    console.error("Error updating service:", err.message);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Xóa dịch vụ
const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ msg: "Dịch vụ không tồn tại" });
    }
    res.json({ msg: "Dịch vụ đã được xóa" });
  } catch (err) {
    console.error("Error deleting service:", err.message);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Thêm voucher vào dịch vụ
const addVoucherToService = async (req, res) => {
  const { voucherId } = req.body;

  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ msg: "Dịch vụ không tồn tại" });
    }

    const voucher = await Voucher.findById(voucherId);
    if (!voucher) {
      return res.status(400).json({ msg: "Voucher không tồn tại" });
    }

    if (service.vouchers.includes(voucherId)) {
      return res.status(400).json({ msg: "Voucher đã được áp dụng cho dịch vụ này" });
    }

    service.vouchers.push(voucherId);
    await service.save();
    res.json(service);
  } catch (err) {
    console.error("Error adding voucher to service:", err.message);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Xóa voucher khỏi dịch vụ
const removeVoucherFromService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ msg: "Dịch vụ không tồn tại" });
    }

    const voucherIndex = service.vouchers.indexOf(req.params.voucherId);
    if (voucherIndex === -1) {
      return res.status(400).json({ msg: "Voucher không được áp dụng cho dịch vụ này" });
    }

    service.vouchers.splice(voucherIndex, 1);
    await service.save();
    res.json(service);
  } catch (err) {
    console.error("Error removing voucher from service:", err.message);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

module.exports = {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  addVoucherToService,
  removeVoucherFromService,
};