// controllers/cartController.js
const Cart = require("../models/cartModel");
const Product = require("../models/Product");
const Voucher = require("../models/Voucher");
const { v4: uuidv4 } = require("uuid");
const { sendOrderConfirmationEmail } = require("../services/emailService");

const generateBookingID = () => {
  return `BOOK${Math.floor(100000 + Math.random() * 900000)}`;
};

const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

// Tạo mới một mục trong giỏ hàng
exports.createCart = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      notes,
      service_id,
      startTime,
      Skincare_staff,
      discountCode,
    } = req.body;

    if (!service_id || !startTime || !customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
    }

    const BookingID = generateBookingID();
    const bookingDate = getCurrentDate();

    const product = await Product.findOne({ service_id }).populate("category", "name");
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const serviceName = product.name;
    const serviceType = product.category.name;
    const duration = product.duration;
    let totalPrice = product.price;

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const totalMinutes = startHour * 60 + startMinute + duration;
    const endHour = Math.floor(totalMinutes / 60);
    const endMinute = totalMinutes % 60;
    const endTime = `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;

    let discountAmount = 0;
    if (discountCode) {
      const voucher = await Voucher.findOne({ code: discountCode, isActive: true });
      if (voucher && new Date(voucher.expiryDate) > new Date()) {
        discountAmount = (totalPrice * voucher.discountPercentage) / 100;
        totalPrice -= discountAmount;
      } else {
        return res.status(400).json({ message: "Mã giảm giá không hợp lệ hoặc đã hết hạn!" });
      }
    }

    const newCart = new Cart({
      CartID: uuidv4(),
      BookingID,
      customerName,
      customerEmail,
      customerPhone,
      notes,
      service_id,
      serviceName,
      serviceType,
      bookingDate,
      startTime,
      endTime,
      duration,
      totalPrice,
      currency: "VND",
      discountCode,
      Skincare_staff,
      status: "pending",
      action: "checkin",
    });

    await newCart.save();
    await sendOrderConfirmationEmail(customerEmail, newCart);

    res.status(201).json({ message: "Cart đã được tạo thành công!", cart: newCart });
  } catch (error) {
    console.error("Error creating cart:", error);
    res.status(500).json({ message: "Lỗi tạo Cart!", error: error.message });
  }
};

// Lấy tất cả giỏ hàng
exports.getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find();
    res.status(200).json(carts);
  } catch (error) {
    console.error("Error fetching carts:", error);
    res.status(500).json({ message: "Lỗi lấy danh sách Cart!", error: error.message });
  }
};

// Lấy giỏ hàng theo CartID
exports.getCartById = async (req, res) => {
  try {
    const { cartID } = req.params;
    const cart = await Cart.findOne({ CartID: cartID });
    if (!cart) return res.status(404).json({ message: "Không tìm thấy Cart!" });
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error fetching cart by ID:", error);
    res.status(500).json({ message: "Lỗi lấy Cart!", error: error.message });
  }
};

// Hủy giỏ hàng (chuyển status thành "cancelled")
exports.deleteCart = async (req, res) => {
  try {
    const { cartID } = req.params;
    const cart = await Cart.findOne({ CartID: cartID });
    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy Cart!" });
    }

    if (cart.status !== "pending") {
      return res.status(400).json({ message: "Chỉ có thể hủy dịch vụ ở trạng thái 'pending'!" });
    }

    cart.status = "cancelled";
    cart.action = null; // Xóa action khi hủy
    await cart.save();

    res.status(200).json({ message: "Cart đã được hủy!", cart });
  } catch (error) {
    console.error("Error cancelling cart:", error);
    res.status(500).json({ message: "Lỗi hủy Cart!", error: error.message });
  }
};

// Cập nhật giỏ hàng (bao gồm check-in/check-out)
exports.updateCart = async (req, res) => {
  try {
    const { cartID } = req.params;
    const updateData = req.body;

    const cart = await Cart.findOne({ CartID: cartID });
    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy Cart!" });
    }

    // Kiểm tra trạng thái trước khi cập nhật
    if (updateData.status) {
      if (cart.status === "cancelled" || cart.status === "completed") {
        return res.status(400).json({ message: "Không thể cập nhật dịch vụ đã hủy hoặc hoàn tất!" });
      }

      if (updateData.status === "checked-in" && cart.status !== "pending") {
        return res.status(400).json({ message: "Chỉ có thể check-in dịch vụ ở trạng thái 'pending'!" });
      }

      if (updateData.status === "completed" && cart.status !== "checked-in") {
        return res.status(400).json({ message: "Chỉ có thể check-out dịch vụ ở trạng thái 'checked-in'!" });
      }
    }

    // Cập nhật status và action
    if (updateData.status === "checked-in") {
      updateData.action = "checkout";
    } else if (updateData.status === "completed") {
      updateData.action = null;
    }

    Object.assign(cart, updateData);

    // Tính lại endTime nếu startTime thay đổi
    if (updateData.startTime && cart.duration) {
      const [startHour, startMinute] = updateData.startTime.split(":").map(Number);
      const totalMinutes = startHour * 60 + startMinute + cart.duration;
      const endHour = Math.floor(totalMinutes / 60);
      const endMinute = totalMinutes % 60;
      cart.endTime = `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;
    }

    await cart.save();
    res.status(200).json({ message: "Cart đã được cập nhật!", cart });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Lỗi cập nhật Cart!", error: error.message });
  }
};

// Check-in dịch vụ (dành cho staff)
exports.checkInCart = async (req, res) => {
  try {
    const { cartID } = req.params;
    const cart = await Cart.findOne({ CartID: cartID });

    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy Cart!" });
    }

    if (cart.status !== "pending") {
      return res.status(400).json({ message: "Chỉ có thể check-in dịch vụ ở trạng thái 'pending'!" });
    }

    cart.status = "checked-in";
    cart.action = "checkout";
    await cart.save();

    res.status(200).json({ message: "Check-in thành công!", cart });
  } catch (error) {
    console.error("Error checking in cart:", error);
    res.status(500).json({ message: "Lỗi check-in Cart!", error: error.message });
  }
};

// Check-out dịch vụ (dành cho staff)
exports.checkOutCart = async (req, res) => {
  try {
    const { cartID } = req.params;
    const cart = await Cart.findOne({ CartID: cartID });

    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy Cart!" });
    }

    if (cart.status !== "checked-in" && cart.status !== "pending") {
      return res.status(400).json({ message: "Chỉ có thể check-out dịch vụ ở trạng thái 'pending' hoặc 'checked-in'!" });
    }

    cart.status = "completed";
    cart.action = null;
    await cart.save();

    res.status(200).json({ message: "Check-out thành công! Thanh toán đã được xác nhận.", cart });
  } catch (error) {
    console.error("Error checking out cart:", error);
    res.status(500).json({ message: "Lỗi check-out Cart!", error: error.message });
  }
};