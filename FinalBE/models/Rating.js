const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  bookingID: { type: String, required: true },
  serviceID: { type: String }, // Loại bỏ required: true nếu không cần thiết
  serviceName: { type: String },
  serviceRating: { type: Number, required: true },
  serviceContent: { type: String, required: true },
  images: [{ type: String }],
  createName: { type: String, required: true },
  status: { type: String, default: "reviewed" },
});

module.exports = mongoose.model("Rating", ratingSchema);
