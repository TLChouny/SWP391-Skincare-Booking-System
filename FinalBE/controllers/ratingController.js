const Rating = require("../models/Rating");
const Service = require("../models/Service");
const User = require("../models/User");
const Booking = require("../models/Booking");

// Tạo đánh giá mới
exports.createRating = async (req, res) => {
  try {
    const {
      BookingID,
      service_id, // Đổi service_id thành serviceID để khớp với schema
      serviceName, // Thêm serviceName vào kiểm tra nếu cần
      serviceRating,
      serviceContent,
      images,
      createName,
    } = req.body;

    // Kiểm tra các trường bắt buộc
    if (
      !BookingID ||
      !service_id || // Đổi service_id thành serviceID
      !serviceRating ||
      !serviceContent ||
      !createName
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Kiểm tra xem người dùng đã đánh giá booking này chưa
    const existingRating = await Rating.findOne({ BookingID, createName });
    if (existingRating) {
      return res
        .status(400)
        .json({ error: "You have already reviewed this booking." });
    }

    // Tìm booking
    const booking = await Booking.findOne({ BookingID: BookingID });
    if (!booking) {
      return res.status(404).json({ error: "Booking not found." });
    }

    // Kiểm tra serviceID trong booking
    if (booking.service_id !== service_id) { // Đổi .equals thành so sánh thông thường vì service_id là chuỗi
      return res.status(400).json({ error: "Service ID does not match booking." });
    }

    // Kiểm tra trạng thái booking
    if (booking.status !== "checked-out") {
      return res.status(400).json({
        error: "You can only review bookings that have been checked-out.",
      });
    }

    // Lấy thông tin dịch vụ để lấy tên
    const service = await Service.findOne({ service_id: service_id }); // Tìm service bằng service_id
    if (!service) {
      return res.status(404).json({ error: "Service not found." });
    }

    const newRating = new Rating({
      BookingID,
      service_id, // Đổi service_id thành serviceID
      serviceName: service.name || serviceName, // Ưu tiên lấy từ Service, nếu không có thì lấy từ req.body
      serviceRating,
      serviceContent,
      images,
      createName,
      status: "reviewed",
    });

    await newRating.save();

    // Cập nhật trạng thái booking
    booking.status = "reviewed";
    await booking.save();

    return res.status(201).json({
      message: "Review submitted successfully!",
      rating: newRating,
    });
  } catch (err) {
    console.error("❌ Error creating rating:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Lấy tất cả đánh giá
exports.getRatings = async (req, res) => {
  try {
    const ratings = await Rating.find();
    res.json(ratings);
  } catch (err) {
    console.error("❌ Error fetching ratings:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Lấy đánh giá theo ID
exports.getRatingById = async (req, res) => {
  try {
    const { id } = req.params;

    const rating = await Rating.findById(id);
    if (!rating) return res.status(404).json({ error: "Rating not found" });

    res.json(rating);
  } catch (err) {
    console.error("❌ Error fetching rating by ID:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Lấy đánh giá theo tên dịch vụ
exports.getRatingsByServiceName = async (req, res) => {
  try {
    const { serviceName } = req.params;
    const ratings = await Rating.find({ serviceName });

    if (ratings.length === 0) {
      return res
        .status(404)
        .json({ error: "No ratings found for this service" });
    }

    res.json(ratings);
  } catch (err) {
    console.error("❌ Error fetching ratings by service name:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật đánh giá
exports.updateRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { serviceRating, serviceContent, images } = req.body;

    const rating = await Rating.findById(id);
    if (!rating) return res.status(404).json({ error: "Rating not found" });

    // Cập nhật thông tin đánh giá
    rating.serviceRating = serviceRating || rating.serviceRating;
    rating.serviceContent = serviceContent || rating.serviceContent;
    rating.images = images || rating.images;

    await rating.save();
    res.json({ message: "Rating updated successfully", rating });
  } catch (err) {
    console.error("❌ Error updating rating:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Xóa đánh giá
exports.deleteRating = async (req, res) => {
  try {
    const { id } = req.params;

    const rating = await Rating.findById(id);
    if (!rating) return res.status(404).json({ error: "Rating not found" });

    await Rating.findByIdAndDelete(id);
    res.json({ message: "Rating deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting rating:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Kiểm tra xem người dùng đã đánh giá dịch vụ này chưa
exports.checkUserReview = async (req, res) => {
  try {
    const { BookingID, username } = req.query;

    if (!BookingID || !username) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const existingRating = await Rating.findOne({
      BookingID,
      createName: username,
    });

    return res.status(200).json({ reviewed: !!existingRating });
  } catch (error) {
    console.error("❌ Error checking user review:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = exports;