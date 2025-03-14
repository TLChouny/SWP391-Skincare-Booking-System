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
  return `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;
};

const calculateDiscount = async (price, discountCode) => {
  const voucher = await Voucher.findOne({ code: discountCode });
  if (voucher) {
    return voucher.discountAmount || (price * (voucher.discountPercentage || 0));
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
      discountCode,
      bookingDate,
    } = req.body;

    if (
      !username ||
      !service_id ||
      !startTime ||
      !customerName ||
      !customerPhone ||
      !bookingDate
    ) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin, bao gồm ngày đặt lịch!" });
    }

    console.log("📌 Received bookingDate from frontend:", bookingDate);

    const BookingID = generateBookingID();

    const product = await Product.findOne({ service_id }).populate("category", "name");
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // Lấy giá gốc và giá giảm từ Product
    const originalPrice = typeof product.price === "object" && product.price.$numberDecimal
      ? parseFloat(product.price.$numberDecimal)
      : product.price || 0;
    const discountedPrice = product.discountedPrice || null;

    // Tính toán totalPrice dựa trên discountedPrice hoặc discountCode
    let finalPrice = originalPrice;
    let finalDiscountedPrice = discountedPrice;
    if (discountedPrice !== null) {
      finalPrice = discountedPrice;
    } else if (discountCode) {
      const discountAmount = await calculateDiscount(originalPrice, discountCode);
      finalPrice = originalPrice - discountAmount;
      finalDiscountedPrice = finalPrice; // Lưu giá sau khi áp dụng discountCode
    }

    const newCart = new Cart({
      CartID: uuidv4(),
      BookingID,
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
      endTime: calculateEndTime(startTime, product.duration),
      duration: product.duration,
      originalPrice: originalPrice, // Lưu giá gốc
      totalPrice: finalPrice, // Giá thực tế thanh toán
      discountedPrice: finalDiscountedPrice, // Giá sau khi giảm
      currency: "VND",
      discountCode,
      Skincare_staff,
      status: "pending",
    });

    await newCart.save();
    await sendOrderConfirmationEmail(customerEmail, newCart);

    res.status(201).json({ message: "Cart đã được tạo thành công!", cart: newCart });
  } catch (error) {
    console.error("📌 Lỗi khi tạo giỏ hàng:", error);
    res.status(500).json({ message: "Lỗi tạo Cart!", error });
  }
};

// Get all carts (for staff)
exports.getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find();
    res.status(200).json(carts);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách Cart!", error });
  }
};

// Get carts by username (for customers)
exports.getCartsByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const decodedUsername = decodeURIComponent(username);
    const carts = await Cart.find({ username: decodedUsername });

    if (!carts.length) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng nào!" });
    }

    res.status(200).json(carts);
  } catch (error) {
    console.error("Lỗi khi lấy giỏ hàng theo username:", error);
    res.status(500).json({ message: "Lỗi khi lấy giỏ hàng!", error: error.message });
  }
};

// Get carts by therapist (for therapists)
exports.getCartsByTherapist = async (req, res) => {
  try {
    const { username } = req.params;
    const decodedUsername = decodeURIComponent(username);
    const carts = await Cart.find({ Skincare_staff: decodedUsername });

    if (!carts.length) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng nào!" });
    }

    res.status(200).json(carts);
  } catch (error) {
    console.error("Lỗi khi lấy giỏ hàng theo therapist:", error);
    res.status(500).json({ message: "Lỗi khi lấy giỏ hàng!", error: error.message });
  }
};

// Get cart by CartID
exports.getCartById = async (req, res) => {
  try {
    const { cartID } = req.params;
    const cart = await Cart.findOne({ CartID: cartID }).populate("userId", "username email");
    if (!cart) return res.status(404).json({ message: "Không tìm thấy Cart!" });
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy Cart!", error });
  }
};

// Delete cart by CartID
exports.deleteCart = async (req, res) => {
  try {
    const { cartID } = req.params;
    const deletedCart = await Cart.findOneAndDelete({ CartID: cartID });
    if (!deletedCart) {
      return res.status(404).json({ message: "Không tìm thấy Cart!" });
    }
    res.status(200).json({ message: "Cart đã được xóa!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa Cart!", error });
  }
};

// Update cart by CartID (supports "completed" and "checked-out")
exports.updateCart = async (req, res) => {
  try {
    const { cartID } = req.params;
    const { status, Skincare_staff } = req.body;

    const cart = await Cart.findOne({ CartID: cartID });
    if (!cart) return res.status(404).json({ message: "Không tìm thấy Cart!" });

    // Status transition validation
    if (status === "checked-in" && cart.status !== "pending") {
      return res.status(400).json({ message: "Chỉ có thể check-in từ trạng thái 'pending'!" });
    }
    if (status === "completed" && cart.status !== "checked-in") {
      return res.status(400).json({ message: "Chỉ có thể complete từ trạng thái 'checked-in'!" });
    }
    if (status === "checked-out" && cart.status !== "completed") {
      return res.status(400).json({ message: "Chỉ có thể check-out từ trạng thái 'completed'!" });
    }
    if (status === "cancel" && cart.status !== "pending") {
      return res.status(400).json({ message: "Chỉ có thể cancel từ trạng thái 'pending'!" });
    }

    if (Skincare_staff !== undefined) cart.Skincare_staff = Skincare_staff;
    if (status) cart.status = status;

    await cart.save();
    res.status(200).json({ message: "Cart đã được cập nhật!", cart });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật Cart!", error: error.message });
  }
};
// Cancel cart
// exports.cancelCart = async (req, res) => {
//   try {
//     const { cartID } = req.params;
//     const cart = await Cart.findOne({ CartID: cartID });
//     if (!cart) {
//       return res.status(404).json({ message: "Không tìm thấy Cart!" });
//     }
//     if (cart.status !== "pending") {
//       return res.status(400).json({ message: "Chỉ có thể hủy đơn hàng ở trạng thái 'pending'!" });
//     }

//     cart.status = "cancel";
//     await cart.save();
//     res.status(200).json({ message: "Cart đã bị hủy!", cart });
//   } catch (error) {
//     res.status(500).json({ message: "Lỗi khi hủy Cart!", error });
//   }
// };