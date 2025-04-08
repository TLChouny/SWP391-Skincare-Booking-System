const mongoose = require("mongoose");
const User = require("../models/User");
const Quiz = require("../models/Quizz"); // Thêm model Question
// const UserResponse = require("../models/UserResponse"); // Thêm model UserResponse
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const { sendAdminVerificationEmail, sendOTP } = require("../utils/email");
const baseUrl = process.env.BASE_URL || "http://localhost:5000/";

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
  check("username", "Tên người dùng đã tồn tại").custom(async (value) => {
    const user = await User.findOne({ username: value });
    if (user) throw new Error("Tên người dùng đã tồn tại");
    return true;
  }),
  check("email", "Email không hợp lệ").isEmail(),
  check("password", "Mật khẩu phải có ít nhất 8 ký tự").isLength({ min: 8 }),
  check("phone_number", "Số điện thoại không hợp lệ").optional().isMobilePhone(),
  check("gender", "Giới tính không hợp lệ").optional().isIn(["male", "female", "other"]),
  check("Description", "Mô tả không hợp lệ").optional().isString(),
  check("address", "Địa chỉ không hợp lệ").optional().isString(),
  check("role", "Vai trò không hợp lệ").optional().isIn([
    "user", "admin", "skincare_staff", "manager", "staff",
  ]),

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
        const verifyToken = jwt.sign(
          { email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "24h" }
        );
        const verifyLink = `${baseUrl}/api/auth/verify-email?token=${verifyToken}`;
        await sendAdminVerificationEmail(email, verifyLink);
      } else {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
        await user.save();
        await sendOTP(email, otp);
      }

      res.status(201).json({
        msg: "Tài khoản đã được tạo. Kiểm tra email để xác thực.",
        userId: user._id,
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
      return res.status(400).json({ msg: "Token không hợp lệ hoặc không được cung cấp" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(400).json({ msg: "Người dùng không tồn tại" });
    }

    if (user.isVerified) {
      return res.status(400).json({ msg: "Tài khoản đã được xác thực trước đó" });
    }

    user.isVerified = true;
    await user.save();

    console.log(`✅ Người dùng ${user.email} đã xác thực thành công!`);

    const redirectUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${redirectUrl}/login`);
  } catch (err) {
    console.error("❌ Lỗi xác thực email:", err);
    if (err.name === "TokenExpiredError") {
      return res.status(400).json({ msg: "Token đã hết hạn" });
    }
    return res.status(400).json({ msg: "Token không hợp lệ", error: err.message });
  }
};

// ✅ Cập nhật thông tin người dùng
const updateUser = async (req, res) => {
  const { username, email, role, phone_number, gender, Description, address, avatar, password } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "Người dùng không tìm thấy" });
    }

    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
      return res.status(403).json({ msg: "Bạn không có quyền cập nhật thông tin này" });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ msg: "Email đã được sử dụng" });
      }
      user.email = email;
      user.isVerified = false;
      const verifyToken = jwt.sign(
        { email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      const verifyLink = `${baseUrl}/api/auth/verify-email?token=${verifyToken}`;
      await sendAdminVerificationEmail(email, verifyLink);
    }

    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ msg: "Tên người dùng đã tồn tại" });
      }
      user.username = username;
    }

    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined && key !== "password" && key !== "email" && key !== "username") {
        user[key] = req.body[key];
      }
    });

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({ msg: "Cập nhật thành công", user: user.toObject({ getters: true, select: "-password" }) });
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
    const staffList = await User.find({ role: "skincare_staff" }).select("-password");
    if (!staffList.length) {
      return res.status(404).json({ msg: "Không tìm thấy nhân viên skincare_staff" });
    }

    res.json(staffList);
  } catch (err) {
    console.error("❌ Lỗi máy chủ khi lấy nhân viên:", err);
    res.status(500).json({ msg: "Lỗi máy chủ", error: err.message });
  }
};

// ✅ Gửi câu trả lời cho quiz
const submitAnswer = async (req, res) => {
  try {
    const { quizId, selectedOptionText } = req.body;
    const userId = req.user.id;

    if (!quizId || !selectedOptionText) {
      return res.status(400).json({
        msg: "Missing required fields (quizId, selectedOptionText)",
      });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ msg: "Quiz not found!" });
    }

    const selectedOption = quiz.options.find(
      (option) => option.text === selectedOptionText
    );
    if (!selectedOption) {
      return res.status(400).json({
        msg: "Selected option does not exist in this quiz!",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found!" });
    }

    // Kiểm tra xem user đã trả lời quiz này chưa
    const existingResponse = user.quizResponses.find(
      (response) => response.quizId.toString() === quizId
    );
    if (existingResponse) {
      return res.status(400).json({ msg: "You have already answered this quiz!" });
    }

    // Thêm câu trả lời mới
    user.quizResponses.push({
      quizId,
      selectedOption: selectedOption.text,
      points: selectedOption.points,
    });

    await user.save();

    res.status(201).json({
      msg: "Answer submitted successfully!",
      response: user.quizResponses[user.quizResponses.length - 1],
    });
  } catch (error) {
    console.error("❌ Error submitting answer:", error);
    res.status(500).json({ msg: "Error submitting answer!", error: error.message });
  }
};

// ✅ Lấy tất cả câu trả lời của một user
const getUserResponses = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    if (req.user.role !== "admin" && req.user.id !== userId) {
      return res.status(403).json({ msg: "Bạn không có quyền xem thông tin này" });
    }

    const user = await User.findById(userId)
      .populate("quizResponses.quizId", "text options")
      .select("quizResponses quizPoints quizCompleted");

    if (!user) {
      return res.status(404).json({ msg: "User not found!" });
    }

    if (!user.quizResponses.length) {
      return res.status(404).json({ msg: "No responses found for this user!" });
    }

    res.status(200).json({
      responses: user.quizResponses,
      totalPoints: Object.fromEntries(user.quizPoints),
      quizCompleted: user.quizCompleted,
    });
  } catch (error) {
    console.error("❌ Error retrieving user responses:", error);
    res.status(500).json({ msg: "Error retrieving responses!", error: error.message });
  }
};
module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getSkincareStaff,
  verifyEmail,
  submitAnswer, // Thêm hàm mới
  getUserResponses, // Thêm hàm mới
};