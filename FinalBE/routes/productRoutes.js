const express = require("express");
const { check, validationResult } = require("express-validator");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Voucher = require("../models/Voucher"); // Import model Voucher

const router = express.Router();

// POST: Tạo product mới
router.post(
  "/",
  [
    check("name", "Tên sản phẩm không được để trống").not().isEmpty(),
    check("price", "Giá sản phẩm phải là số hợp lệ").matches(
      /^\d{1,3}(\.\d{3})*$/
    ),
    check("duration", "Thời gian phải là số nguyên").isInt(),
    check("category", "ID danh mục không hợp lệ").isMongoId(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let { name, description, price, duration, category, image, vouchers } = req.body;

    // Xử lý giá tiền
    if (typeof price === "string") {
      price = price.replace(/\./g, "");
    } else if (typeof price === "number") {
      price = price.toString();
    } else {
      return res.status(400).json({ msg: "Giá sản phẩm không hợp lệ" });
    }

    try {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ msg: "Danh mục không tồn tại" });
      }

      // Kiểm tra nếu có vouchers được gửi lên
      if (vouchers && Array.isArray(vouchers)) {
        const validVouchers = await Voucher.find({ _id: { $in: vouchers } });
        if (validVouchers.length !== vouchers.length) {
          return res.status(400).json({ msg: "Một hoặc nhiều voucher không tồn tại" });
        }
      }

      const lastProduct = await Product.findOne().sort({ service_id: -1 });
      const newServiceId = lastProduct ? lastProduct.service_id + 1 : 1;

      const product = new Product({
        service_id: newServiceId,
        name,
        description,
        price,
        duration,
        category,
        image: image || "",
        vouchers: vouchers || [], // Thêm vouchers nếu có
      });

      await product.save();
      res.status(201).json(product);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Lỗi máy chủ");
    }
  }
);

// GET: Lấy tất cả product kèm vouchers
router.get("/", async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name description")
      .populate("vouchers", "code discountPercentage expiryDate isActive");

    const productsWithDiscount = products.map(product => {
      const price = product.price;
      const vouchers = product.vouchers || [];
      const highestDiscount = vouchers.length > 0 
        ? Math.max(...vouchers.map(v => v.discountPercentage || 0)) 
        : 0;
      const discountedPrice = price - (price * highestDiscount) / 100;

      return {
        ...product.toObject(),
        discountedPrice: vouchers.length > 0 ? discountedPrice : null,
      };
    });

    res.json(productsWithDiscount);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Lỗi máy chủ");
  }
});
// GET: Lấy một product theo ID kèm vouchers
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name description")
      .populate("vouchers", "code discountPercentage expiryDate isActive");
    if (!product) {
      return res.status(404).json({ msg: "Sản phẩm không tồn tại" });
    }

    const price = product.price;
    const vouchers = product.vouchers || [];
    const highestDiscount = vouchers.length > 0 
      ? Math.max(...vouchers.map(v => v.discountPercentage || 0)) 
      : 0;
    const discountedPrice = price - (price * highestDiscount) / 100;

    res.json({
      ...product.toObject(),
      discountedPrice: vouchers.length > 0 ? discountedPrice : null,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Lỗi máy chủ");
  }
});

// PUT: Cập nhật product (bao gồm thêm/xóa vouchers)
router.put("/:id", async (req, res) => {
  const { name, description, price, duration, category, image, vouchers } = req.body;

  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: "Sản phẩm không tồn tại" });
    }

    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ msg: "Danh mục không tồn tại" });
      }
    }

    // Kiểm tra và cập nhật vouchers nếu được gửi lên
    if (vouchers !== undefined) {
      if (!Array.isArray(vouchers)) {
        return res.status(400).json({ msg: "Vouchers phải là một mảng" });
      }
      const validVouchers = await Voucher.find({ _id: { $in: vouchers } });
      if (validVouchers.length !== vouchers.length) {
        return res.status(400).json({ msg: "Một hoặc nhiều voucher không tồn tại" });
      }
      product.vouchers = vouchers;
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.duration = duration || product.duration;
    product.category = category || product.category;
    product.image = image || product.image;

    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Lỗi máy chủ");
  }
});

// DELETE: Xóa product
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: "Sản phẩm đã được xóa" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Lỗi máy chủ");
  }
});

// POST: Thêm voucher vào product
router.post("/:id/vouchers", async (req, res) => {
  const { voucherId } = req.body;

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: "Sản phẩm không tồn tại" });
    }

    const voucher = await Voucher.findById(voucherId);
    if (!voucher) {
      return res.status(400).json({ msg: "Voucher không tồn tại" });
    }

    if (product.vouchers.includes(voucherId)) {
      return res.status(400).json({ msg: "Voucher đã được áp dụng cho sản phẩm này" });
    }

    product.vouchers.push(voucherId);
    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Lỗi máy chủ");
  }
});

// DELETE: Xóa voucher khỏi product
router.delete("/:id/vouchers/:voucherId", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: "Sản phẩm không tồn tại" });
    }

    const voucherIndex = product.vouchers.indexOf(req.params.voucherId);
    if (voucherIndex === -1) {
      return res.status(400).json({ msg: "Voucher không được áp dụng cho sản phẩm này" });
    }

    product.vouchers.splice(voucherIndex, 1);
    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Lỗi máy chủ");
  }
});

module.exports = router;