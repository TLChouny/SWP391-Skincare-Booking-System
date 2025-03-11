const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  CartID: { type: String, required: true, unique: true },
  BookingID: { type: String, required: true, unique: true },
  username: { type: String, required: true }, // Customer who created the cart
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  notes: { type: String },
  service_id: { type: Number, required: true },
  serviceName: { type: String, required: true },
  serviceType: { type: String },
  bookingDate: { type: String, required: true }, // e.g., "2025-03-15"
  startTime: { type: String, required: true },
  endTime: { type: String },
  duration: { type: Number },
  totalPrice: { type: Number, required: true },
  currency: { type: String, default: "VND" },
  discountCode: { type: String },
  Skincare_staff: { type: String }, // Therapist assigned to the cart
  status: {
    type: String,
    enum: ["pending", "checked-in", "completed", "checked-out", "cancel"],
    default: "pending",
  },
});

module.exports = mongoose.model("Cart", cartSchema);