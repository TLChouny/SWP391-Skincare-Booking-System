const Cart = require("../models/cartModel");
const Product = require("../models/Product");
const Voucher = require("../models/Voucher");
const { v4: uuidv4 } = require("uuid");
const { sendOrderConfirmationEmail } = require("../services/emailService");
const User = require("../models/User");

const generateBookingID = () => {
  return `BOOK${Math.floor(100000 + Math.random() * 900000)}`;
};

const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const calculateEndTime = (startTime, duration) => {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const totalMinutes = startHour * 60 + startMinute + duration;
  const endHour = Math.floor(totalMinutes / 60);
  const endMinute = totalMinutes % 60;
  return `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(
    2,
    "0"
  )}`;
};

const calculateDiscount = async (price, discountCode) => {
  const voucher = await Voucher.findOne({ code: discountCode });
  if (voucher) {
    return voucher.discountAmount || price * (voucher.discountPercentage || 0);
  }
  return 0;
};

// Create a new cart
exports.createCart = async (req, res) => {
  try {
    const {
      username,
      customerName,
      customerEmail,
      customerPhone,
      notes,
      service_id,
      startTime,
      Skincare_staff,
      bookingDate,
      description,
    } = req.body;

    if (
      !username ||
      !service_id ||
      !startTime ||
      !customerName ||
      !customerPhone ||
      !bookingDate
    ) {
      return res.status(400).json({
        message: "Please provide all required information, including booking date!",
      });
    }

    console.log(
      "📌 Checking booked time:",
      bookingDate,
      startTime,
      Skincare_staff
    );

    const product = await Product.findOne({ service_id }).populate(
      "category",
      "name"
    );
    if (!product) {
      return res.status(404).json({ message: "Service not found!" });
    }

    const endTime = calculateEndTime(startTime, product.duration);

    if (Skincare_staff) {
      const existingBooking = await Cart.findOne({
        bookingDate,
        Skincare_staff,
        status: { $in: ["pending", "checked-in"] },
        $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
      });

      if (existingBooking) {
        console.log("📌 Staff has a conflicting schedule!");
        return res.status(400).json({
          message: `Staff ${Skincare_staff} is already booked from ${existingBooking.startTime} to ${existingBooking.endTime}. Please choose another time.`,
          startTime: existingBooking.startTime,
          endTime: existingBooking.endTime,
        });
      }
    }

    console.log("📌 No time conflict, proceeding with booking.");

    const originalPrice =
      typeof product.price === "object" && product.price.$numberDecimal
        ? parseFloat(product.price.$numberDecimal)
        : product.price || 0;
    const discountedPrice = product.discountedPrice || null;
    let finalPrice = discountedPrice !== null ? discountedPrice : originalPrice;

    const newCart = new Cart({
      CartID: uuidv4(),
      BookingID: generateBookingID(),
      username,
      customerName,
      customerEmail,
      customerPhone,
      notes,
      service_id,
      serviceName: product.name,
      serviceType: product.category?.name,
      bookingDate,
      startTime,
      endTime,
      duration: product.duration,
      originalPrice,
      totalPrice: finalPrice,
      discountedPrice,
      currency: "VND",
      Skincare_staff: Skincare_staff,
      status: "pending",
      description,
    });

    await newCart.save();
    console.log("📌 Booking successful:", newCart);

    await sendOrderConfirmationEmail(customerEmail, newCart);

    res.status(201).json({
      message: "Booking successful! A confirmation email has been sent.",
      cart: newCart,
    });
  } catch (error) {
    console.error("📌 Error creating cart:", error);
    res.status(500).json({ message: "Error creating booking!", error });
  }
};

// Get all carts (for staff)
exports.getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find();
    res.status(200).json(carts);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving cart list!", error });
  }
};

// Get carts by username (for customers)
exports.getCartsByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const decodedUsername = decodeURIComponent(username);
    const carts = await Cart.find({ username: decodedUsername });

    if (!carts.length) {
      return res.status(404).json({ message: "No carts found!" });
    }

    console.log("📌 Orders Data from DB:", carts); // 🛑 Checking data from MongoDB

    res.status(200).json(carts);
  } catch (error) {
    console.error("Error retrieving carts by username:", error);
    res
      .status(500)
      .json({ message: "Error retrieving carts!", error: error.message });
  }
};

// Get carts by therapist (for therapists)
exports.getCartsByTherapist = async (req, res) => {
  try {
    const { username } = req.params;
    const decodedUsername = decodeURIComponent(username);
    const carts = await Cart.find({ Skincare_staff: decodedUsername });

    if (!carts.length) {
      return res.status(404).json({ message: "No carts found!" });
    }

    res.status(200).json(carts);
  } catch (error) {
    console.error("Error retrieving carts by therapist:", error);
    res
      .status(500)
      .json({ message: "Error retrieving carts!", error: error.message });
  }
};

// Get cart by CartID
exports.getCartById = async (req, res) => {
  try {
    const { cartID } = req.params;
    const cart = await Cart.findOne({ CartID: cartID }).populate(
      "userId",
      "username email"
    );
    if (!cart) return res.status(404).json({ message: "Cart not found!" });
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving cart!", error });
  }
};

// Delete cart by CartID
exports.deleteCart = async (req, res) => {
  try {
    const { cartID } = req.params;
    const deletedCart = await Cart.findOneAndDelete({ CartID: cartID });
    if (!deletedCart) {
      return res.status(404).json({ message: "Cart not found!" });
    }
    res.status(200).json({ message: "Cart deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting cart!", error });
  }
};

// Update cart by CartID (supports "completed" and "checked-out")
exports.updateCart = async (req, res) => {
  try {
    const { cartID } = req.params;
    const { status, Skincare_staff, description } = req.body;

    const cart = await Cart.findOne({ CartID: cartID });
    if (!cart) return res.status(404).json({ message: "Cart not found!" });
    if (description !== undefined) {
      cart.description = description;
    }
    // Status transition validation
    if (status === "checked-in" && cart.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Can only check-in from 'pending' status!" });
    }
    if (status === "completed" && cart.status !== "checked-in") {
      return res
        .status(400)
        .json({ message: "Can only complete from 'checked-in' status!" });
    }
    if (status === "checked-out" && cart.status !== "completed") {
      return res
        .status(400)
        .json({ message: "Can only check-out from 'completed' status!" });
    }
    if (status === "cancel" && cart.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Can only cancel from 'pending' status!" });
    }

    if (Skincare_staff !== undefined) cart.Skincare_staff = Skincare_staff;
    if (status) cart.status = status;

    await cart.save();
    res.status(200).json({ message: "Cart updated successfully!", cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating cart!", error: error.message });
  }
};

// Get booked slots
exports.getBookedSlots = async (req, res) => {
  try {
    const { date, staff } = req.query;

    if (!staff) {
      return res.status(400).json({ message: "Staff name is required." });
    }

    const query = {
      Skincare_staff: staff,
      status: { $in: ["pending", "checked-in"] },
    };

    if (date) {
      query.bookingDate = date;
    }

    const bookedSlots = await Cart.find(query)
      .select("startTime endTime bookingDate") // ❗ Include endTime in select
      .sort({ bookingDate: 1, startTime: 1 })
      .lean();

    res.status(200).json(bookedSlots);
  } catch (error) {
    console.error("Error retrieving slots:", error);
    res.status(500).json({ message: "Error retrieving slots!", error });
  }
};