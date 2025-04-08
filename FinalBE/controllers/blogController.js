const mongoose = require("mongoose");
const Blog = require("../models/Blog");
const Category = require("../models/Category");

// Lấy tất cả bài viết
const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: error.message });
  }
};

// Tạo bài viết mới
const createBlog = async (req, res) => {
  try {
    const { title, content, image, createName, categoryId } = req.body;

    if (!title || !content || !categoryId) {
      return res.status(400).json({ message: "Title, content, and categoryId are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "Invalid categoryId" });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const newBlog = new Blog({
      title,
      content,
      image: image || "",
      createName: createName || "Unknown",
      categoryId: category._id,
      categoryName: category.name,
    });

    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ message: error.message });
  }
};

// Lấy bài viết theo ID
const getBlogById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
      return res.status(400).json({ message: "Invalid blog ID" });
    }

    const blog = await Blog.findById(req.params._id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.json(blog);
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật bài viết theo ID
const updateBlog = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
      return res.status(400).json({ message: "Invalid blog ID" });
    }

    const { title, content, image, createName, categoryId } = req.body;

    if (!title || !content || !categoryId) {
      return res.status(400).json({ message: "Title, content, and categoryId are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "Invalid categoryId" });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params._id,
      {
        title,
        content,
        image: image || "",
        createName: createName || "Unknown",
        categoryId: category._id,
        categoryName: category.name,
      },
      { new: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.json(updatedBlog);
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ message: error.message });
  }
};

// Xóa bài viết theo ID
const deleteBlog = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
      return res.status(400).json({ message: "Invalid blog ID" });
    }

    const deletedBlog = await Blog.findByIdAndDelete(req.params._id);
    if (!deletedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllBlogs,
  createBlog,
  getBlogById,
  updateBlog,
  deleteBlog,
};