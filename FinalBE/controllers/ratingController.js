const Rating = require("../models/Rating");
const Product = require("../models/Product");
const User = require("../models/User");
const Cart = require("../models/cartModel");
exports.createRating = async (req, res) => {
  try {
    const {
      bookingID,
      service_id,
      serviceRating,
      serviceContent,
      images,
      createName,
    } = req.body;

    if (
      !bookingID ||
      !service_id ||
      !serviceRating ||
      !serviceContent ||
      !createName
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingRating = await Rating.findOne({ bookingID, createName });

    if (existingRating) {
      return res
        .status(400)
        .json({ error: "You have already reviewed this order." });
    }

    const cart = await Cart.findOne({ BookingID: bookingID });

    if (!cart) {
      return res.status(404).json({ error: "Order not found." });
    }

    if (!cart.service_id) {
      return res.status(400).json({ error: "Service ID is missing in order." });
    }

    if (cart.status !== "checked-out") {
      return res
        .status(400)
        .json({
          error: "You can only review orders that have been checked-out.",
        });
    }

    const newRating = new Rating({
      bookingID,
      service_id: cart.service_id,
      serviceName: cart.serviceName,
      serviceRating,
      serviceContent,
      images,
      createName,
      status: "reviewed",
    });

    await newRating.save();

    cart.status = "reviewed";
    await cart.save();

    return res
      .status(201)
      .json({ message: "Review submitted successfully!", rating: newRating });
  } catch (err) {
    console.error("❌ Error creating rating:", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.getRatings = async (req, res) => {
  try {
    const ratings = await Rating.find();
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRatingById = async (req, res) => {
  try {
    const { id } = req.params;

    const rating = await Rating.findById(id);
    if (!rating) return res.status(404).json({ error: "Rating not found" });

    res.json(rating);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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
    res.status(500).json({ error: err.message });
  }
};

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
    res.status(500).json({ error: err.message });
  }
};

exports.deleteRating = async (req, res) => {
  try {
    const { id } = req.params;

    const rating = await Rating.findById(id);
    if (!rating) return res.status(404).json({ error: "Rating not found" });

    await Rating.findByIdAndDelete(id);
    res.json({ message: "Rating deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Kiểm tra xem người dùng đã đánh giá dịch vụ này chưa
exports.checkUserReview = async (req, res) => {
  try {
    const { bookingID, username } = req.query;

    if (!bookingID || !username) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // ✅ Kiểm tra nếu rating tồn tại
    const existingRating = await Rating.findOne({
      bookingID,
      createName: username,
    });

    if (existingRating) {
      return res.status(200).json({ reviewed: true });
    } else {
      return res.status(200).json({ reviewed: false });
    }
  } catch (error) {
    console.error("❌ Error checking user review:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
