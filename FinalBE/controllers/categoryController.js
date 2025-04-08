const { check, validationResult } = require("express-validator");
const Category = require("../models/Category");

// Tạo danh mục mới
const createCategory = [
  check("name", "Tên danh mục không được để trống").not().isEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    try {
      let category = await Category.findOne({ name });
      if (category) {
        return res.status(400).json({ msg: "Danh mục đã tồn tại" });
      }

      category = new Category({ name, description });
      await category.save();

      res.status(201).json(category);
    } catch (err) {
      console.error("Error creating category:", err.message);
      res.status(500).json({ message: "Lỗi máy chủ" });
    }
  },
];

// Lấy tất cả danh mục
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err.message);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Lấy danh mục theo ID
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ msg: "Danh mục không tồn tại" });
    }
    res.json(category);
  } catch (err) {
    console.error("Error fetching category:", err.message);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Cập nhật danh mục theo ID
const updateCategory = [
  check("name", "Tên danh mục không được để trống").optional().not().isEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    try {
      let category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ msg: "Danh mục không tồn tại" });
      }

      category.name = name || category.name;
      category.description = description || category.description;
      category.updatedAt = new Date();

      await category.save();
      res.json(category);
    } catch (err) {
      console.error("Error updating category:", err.message);
      res.status(500).json({ message: "Lỗi máy chủ" });
    }
  },
];

// Xóa danh mục theo ID
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ msg: "Danh mục không tồn tại" });
    }

    await category.deleteOne();
    res.json({ msg: "Danh mục đã được xóa" });
  } catch (err) {
    console.error("Error deleting category:", err.message);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};