// models/cartModel.js
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  CartID: { type: String, required: true, unique: true },           // ID duy nhất của mục trong giỏ hàng
  BookingID: { type: String, required: true, unique: true },        // ID đặt lịch (ví dụ: BOOK123456)
  customerName: { type: String, required: true },                   // Tên khách hàng
  customerEmail: { type: String, required: true },                  // Email khách hàng
  customerPhone: { type: String, required: true },                  // Số điện thoại khách hàng
  notes: { type: String },                                         // Ghi chú (tùy chọn)
  service_id: { type: Number, required: true },                    // ID dịch vụ
  serviceName: { type: String, required: true },                   // Tên dịch vụ
  serviceType: { type: String, required: true },                   // Loại dịch vụ (từ category)
  bookingDate: { type: String, required: true },                   // Ngày đặt lịch (ISO: "YYYY-MM-DD")
  startTime: { type: String, required: true },                     // Thời gian bắt đầu (HH:MM)
  endTime: { type: String, required: true },                       // Thời gian kết thúc (HH:MM)
  duration: { type: Number, required: true },                      // Thời lượng (phút)
  totalPrice: { type: Number, required: true },                    // Tổng giá tiền sau giảm giá
  currency: { type: String, default: "VND" },                      // Đơn vị tiền tệ
  discountCode: { type: String },                                  // Mã giảm giá (tùy chọn)
  Skincare_staff: { type: String },                                // ID nhân viên phụ trách (tùy chọn)
  status: {                                                        // Trạng thái dịch vụ
    type: String,
    enum: ["pending", "checked-in", "completed", "cancelled"],     // Các trạng thái hợp lệ
    default: "pending",                                            // Mặc định là pending
  },
  action: {                                                        // Hành động tiếp theo
    type: String,
    enum: ["checkin", "checkout", null],                          // Các hành động: checkin, checkout, hoặc không có
    default: "checkin",                                           // Mặc định là checkin khi tạo mới
  },
  createdAt: { type: Date, default: Date.now },                    // Thời gian tạo
  updatedAt: { type: Date, default: Date.now },                    // Thời gian cập nhật
});

// Cập nhật updatedAt trước khi save
cartSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Cart", cartSchema);