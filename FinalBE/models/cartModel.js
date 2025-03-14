const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  CartID: { type: String, required: true, unique: true },
  BookingID: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  notes: { type: String },
  service_id: { type: Number, required: true },
  serviceName: { type: String, required: true },
  serviceType: { type: String },
  bookingDate: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String },
  duration: { type: Number },
  originalPrice: { type: Number }, // Thêm: Giá gốc trước khi giảm
  totalPrice: { type: Number, required: true }, // Giá thực tế thanh toán (sau khi giảm)
  discountedPrice: { type: Number }, // Giá sau khi giảm (nếu có)
  currency: { type: String, default: "VND" },
  discountCode: { type: String },
  Skincare_staff: { type: String },
  status: {
    type: String,
    enum: ["pending", "checked-in", "completed", "checked-out", "cancel"],
    default: "pending",
  },
});

module.exports = mongoose.model("Cart", cartSchema);