const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");

// ✅ Lấy tất cả người dùng (Chỉ Admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Lỗi máy chủ");
  }
};

// ✅ Lấy thông tin người dùng theo ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "Người dùng không tìm thấy" });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Lỗi máy chủ");
  }
};

// ✅ Tạo người dùng mới (Chỉ Admin)
const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    username,
    email,
    password,
    role,
    phone_number,
    gender,
    address,
    avatar,
  } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "Email đã được sử dụng" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || "user",
      isVerified: false,
      phone_number,
      gender,
      address,
      avatar: avatar || "default-avatar.png",
    });

    await newUser.save();
    res.status(201).json({ msg: "Tài khoản đã được tạo", user: newUser });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Lỗi máy chủ");
  }
};

// ✅ Cập nhật thông tin người dùng
const updateUser = async (req, res) => {
  const { username, email, role, phone_number, gender, avatar, password } =
    req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "Người dùng không tìm thấy" });
    }

    // Cập nhật các trường có trong request
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined && key !== "password") {
        user[key] = req.body[key];
      }
    });

    // Nếu có mật khẩu mới, băm mật khẩu trước khi cập nhật
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({ msg: "Cập nhật thành công", user });
  } catch (err) {
    console.error("Lỗi cập nhật:", err);
    res.status(500).send("Lỗi máy chủ");
  }
};

// ✅ Xóa người dùng (Chỉ Admin)
const deleteUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: "ID không hợp lệ" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "Người dùng không tìm thấy" });
    }

    res.json({ msg: "Người dùng đã được xóa" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Lỗi máy chủ");
  }
};

// 📌 Lấy danh sách nhân viên có role "skincare_staff" (Cho phép user bình thường truy cập)
const getSkincareStaff = async (req, res) => {
  try {

    const staffList = await User.find({ role: "skincare_staff" }).select(
      "-password"
    );

    if (!staffList.length) {
      console.log("⚠️ Không tìm thấy nhân viên skincare_staff.");
      return res
        .status(404)
        .json({ msg: "Không tìm thấy nhân viên skincare_staff" });
    }

    res.json(staffList);
  } catch (err) {
    console.error("❌ Lỗi máy chủ khi lấy nhân viên:", err);
    res.status(500).send("Lỗi máy chủ");
  }
};

// ✅ Xuất các hàm
module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getSkincareStaff,
};