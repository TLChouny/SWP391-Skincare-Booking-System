const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const { sendAdminVerificationEmail, sendOTP } = require("../utils/email");

// ✅ Lấy tất cả người dùng (Chỉ Admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách người dùng:", err);
    res.status(500).json({ msg: "Lỗi máy chủ", error: err.message });
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
    console.error("❌ Lỗi khi lấy thông tin người dùng:", err);
    res.status(500).json({ msg: "Lỗi máy chủ", error: err.message });
  }
};

// ✅ Tạo người dùng mới (Chỉ Admin)
const createUser = [
  check("username", "Tên người dùng không được để trống").not().isEmpty(),
  check("email", "Email không hợp lệ").isEmail(),
  check("password", "Mật khẩu phải có ít nhất 8 ký tự").isLength({ min: 8 }),
  check("phone_number", "Số điện thoại không hợp lệ")
    .optional()
    .isMobilePhone(),
  check("gender", "Giới tính không hợp lệ")
    .optional()
    .isIn(["male", "female", "other"]),
    check("Description", "Mô tả không hợp lệ").optional().isString(),
  check("address", "Địa chỉ không hợp lệ").optional().isString(),

  async (req, res) => {
    try {
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
        Description,
        address,
        avatar,
      } = req.body;

      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: "Email đã được sử dụng" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = new User({
        username,
        email,
        password: hashedPassword,
        role: role || "user",
        isVerified: false,
        phone_number,
        gender,
        Description,
        address,
        avatar: avatar || "default-avatar.png",
      });

      await user.save();

      if (["admin", "skincare_staff", "manager", "staff"].includes(role)) {
        // ✅ Tạo token xác thực cho Admin và Staff
        const verifyToken = jwt.sign(
          { email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "24h" }
        );

        const verifyLink = `http://localhost:5000/api/auth/auto-verify?token=${verifyToken}`;
        await sendAdminVerificationEmail(email, verifyLink);
      } else {
        // ✅ Tạo OTP cho User bình thường
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
        await user.save();
        await sendOTP(email, otp);
      }

      res.status(200).json({
        msg: "Tài khoản đã được tạo. Kiểm tra email để xác thực.",
        email,
      });
    } catch (err) {
      console.error("❌ Lỗi tạo tài khoản:", err);
      res.status(500).json({ msg: "Lỗi máy chủ", error: err.message });
    }
  },
];

// ✅ Xác thực Email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res
        .status(400)
        .json({ msg: "Token không hợp lệ hoặc không được cung cấp" });
    }

    // ✅ Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(400).json({ msg: "Người dùng không tồn tại" });
    }

    // ✅ Cập nhật trạng thái xác thực
    user.isVerified = true;
    await user.save();

    console.log(`✅ Người dùng ${user.email} đã xác thực thành công!`);

    // ✅ Chuyển hướng về trang login
    res.redirect("http://localhost:3000/login");
  } catch (err) {
    console.error("❌ Lỗi xác thực email:", err);
    return res
      .status(400)
      .json({ msg: "Token không hợp lệ hoặc đã hết hạn", error: err.message });
  }
};


// ✅ Cập nhật thông tin người dùng
const updateUser = async (req, res) => {
  const { username, email, role, phone_number, gender, Description, address, avatar, password } =
    req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "Người dùng không tìm thấy" });
    }

    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined && key !== "password") {
        user[key] = req.body[key];
      }
    });

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({ msg: "Cập nhật thành công", user });
  } catch (err) {
    console.error("❌ Lỗi cập nhật:", err);
    res.status(500).json({ msg: "Lỗi máy chủ", error: err.message });
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
    console.error("❌ Lỗi khi xóa người dùng:", err);
    res.status(500).json({ msg: "Lỗi máy chủ", error: err.message });
  }
};

// 📌 Lấy danh sách nhân viên có role "skincare_staff"
const getSkincareStaff = async (req, res) => {
  try {
    const staffList = await User.find({ role: "skincare_staff" }).select(
      "-password"
    );
    if (!staffList.length) {
      return res
        .status(404)
        .json({ msg: "Không tìm thấy nhân viên skincare_staff" });
    }

    res.json(staffList);
  } catch (err) {
    console.error("❌ Lỗi máy chủ khi lấy nhân viên:", err);
    res.status(500).json({ msg: "Lỗi máy chủ", error: err.message });
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
  verifyEmail,
};