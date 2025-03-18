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
      Skincare_staff, // 👈 Có thể không bắt buộc
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
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin, bao gồm ngày đặt lịch!",
      });
    }

    console.log(
      "📌 Kiểm tra giờ đã đặt:",
      bookingDate,
      startTime,
      Skincare_staff
    );

    const product = await Product.findOne({ service_id }).populate(
      "category",
      "name"
    );
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const endTime = calculateEndTime(startTime, product.duration);

    // 🔥 Nếu chọn nhân viên, kiểm tra lịch làm việc
    if (Skincare_staff) {
      const existingBooking = await Cart.findOne({
        bookingDate,
        Skincare_staff,
        status: { $in: ["pending", "checked-in"] }, // Chỉ kiểm tra lịch chưa hoàn thành
        $or: [
          { startTime: { $lt: endTime }, endTime: { $gt: startTime } }, // 📌 Trùng thời gian với lịch khác
        ],
      });

      if (existingBooking) {
        console.log("📌 Nhân viên đã có lịch trùng giờ!");
        return res.send(
          `Nhân viên ${Skincare_staff} đã có lịch từ ${existingBooking.startTime} đến ${existingBooking.endTime}. Vui lòng chọn giờ khác.`
        );
      }
    }

    console.log("📌 Không có trùng giờ, tiếp tục đặt lịch.");

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
    });

    await newCart.save();
    console.log("📌 Đặt lịch thành công:", newCart);

    await sendOrderConfirmationEmail(customerEmail, newCart);

    res.status(201).json({
      message: "Đặt lịch thành công! Email xác nhận đã được gửi.",
      cart: newCart,
    });
  } catch (error) {
    console.error("📌 Lỗi khi tạo giỏ hàng:", error);
    res.status(500).json({ message: "Lỗi tạo đặt lịch!", error });
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

    console.log("📌 Orders Data from DB:", carts); // 🛑 Kiểm tra dữ liệu từ MongoDB

    res.status(200).json(carts);
  } catch (error) {
    console.error("Lỗi khi lấy giỏ hàng theo username:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi lấy giỏ hàng!", error: error.message });
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
    res
      .status(500)
      .json({ message: "Lỗi khi lấy giỏ hàng!", error: error.message });
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
      return res
        .status(400)
        .json({ message: "Chỉ có thể check-in từ trạng thái 'pending'!" });
    }
    if (status === "completed" && cart.status !== "checked-in") {
      return res
        .status(400)
        .json({ message: "Chỉ có thể complete từ trạng thái 'checked-in'!" });
    }
    if (status === "checked-out" && cart.status !== "completed") {
      return res
        .status(400)
        .json({ message: "Chỉ có thể check-out từ trạng thái 'completed'!" });
    }
    if (status === "cancel" && cart.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Chỉ có thể cancel từ trạng thái 'pending'!" });
    }

    if (Skincare_staff !== undefined) cart.Skincare_staff = Skincare_staff;
    if (status) cart.status = status;

    await cart.save();
    res.status(200).json({ message: "Cart đã được cập nhật!", cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi cập nhật Cart!", error: error.message });
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
exports.getBookedSlots = async (req, res) => {
  try {
    const { date, staff } = req.query;

    if (!date || !staff) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp ngày và nhân viên." });
    }

    console.log(`📌 Lấy giờ đã đặt cho ngày ${date}, nhân viên: ${staff}`);

    const bookedSlots = await Cart.find({
      bookingDate: date,
      Skincare_staff: staff,
      status: { $in: ["pending", "checked-in"] }, // Chỉ lấy lịch chưa hoàn thành
    })
      .select("startTime")
      .lean();

    console.log(
      "📌 Giờ đã đặt (từ DB):",
      bookedSlots.map((b) => b.startTime)
    );

    res.status(200).json(bookedSlots.map((b) => b.startTime)); // Chỉ trả về danh sách giờ
  } catch (error) {
    console.error("📌 Lỗi lấy danh sách giờ đã đặt:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách giờ đã đặt!", error });
  }
};
