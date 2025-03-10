const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    phone_number: { type: String },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    address: { type: String },
    role: {
      type: String,
      enum: ["user", "admin", "skincare_staff", "manager", "staff"],
      default: "user",
    },
    avatar: { type: String, default: "default-avatar.png" },
    otp: { type: String },
    otpExpires: { type: Date },
    isVerified: { type: Boolean, default: false },
    Description: { type: String },
    // 🔥 Thêm trường token để lưu JWT
    token: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);