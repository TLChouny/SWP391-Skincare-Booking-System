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
    token: { type: String, default: null },

    // 🔥 Bổ sung: Lưu kết quả quiz của user
    quizResponses: [
      {
        quizId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Quiz",
          required: true,
        },
        selectedOption: {
          type: String,
          required: true,
        },
        points: {
          type: Map,
          of: Number,
          required: true,
        },
        answeredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // 🔥 Bổ sung: Tổng điểm theo category
    quizPoints: {
      type: Map,
      of: Number,
      default: () => new Map(),
    },

    // 🔥 Bổ sung: Trạng thái hoàn thành quiz (tuỳ chọn)
    quizCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Middleware để cập nhật quizPoints khi quizResponses thay đổi
UserSchema.pre("save", function (next) {
  if (this.isModified("quizResponses")) {
    const totalPoints = new Map();
    this.quizResponses.forEach((response) => {
      for (let [category, points] of response.points) {
        totalPoints.set(category, (totalPoints.get(category) || 0) + points);
      }
    });
    this.quizPoints = totalPoints;
  }
  next();
});

module.exports = mongoose.model("User", UserSchema);