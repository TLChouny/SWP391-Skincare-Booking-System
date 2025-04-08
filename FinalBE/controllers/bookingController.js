const Booking = require("../models/Booking");
const Service = require("../models/Service");
const Voucher = require("../models/Voucher");
const { sendOrderConfirmationEmail } = require("../services/emailService");
const User = require("../models/User");

// Hàm sinh số ngẫu nhiên 6 chữ số
const generateRandomSixDigitNumber = () => {
  const min = 100000; // Số nhỏ nhất: 100000
  const max = 999999; // Số lớn nhất: 999999
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return String(randomNumber).padStart(6, "0"); // Đảm bảo luôn có 6 chữ số
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
    return voucher.discountAmount || price * (voucher.discountPercentage || 0);
  }
  return 0;
};

// Create a new booking
exports.createBooking = async (req, res) => {
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

    console.log("📌 Checking booked time:", bookingDate, startTime, Skincare_staff);

    const service = await Service.findOne({ service_id }).populate("category", "name");
    if (!service) {
      return res.status(404).json({ message: "Service not found!" });
    }

    const endTime = calculateEndTime(startTime, service.duration);

    if (Skincare_staff) {
      const existingBooking = await Booking.findOne({
        bookingDate,
        Skincare_staff,
        status: {
          $in: ["pending", "checked-in", "completed", "checked-out", "reviewed"],
        },
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
      typeof service.price === "object" && service.price.$numberDecimal
        ? parseFloat(service.price.$numberDecimal)
        : service.price || 0;
    const discountedPrice = service.discountedPrice || null;
    let finalPrice = discountedPrice !== null ? discountedPrice : originalPrice;

    // Tạo BookingID và BookingCode với định dạng mới (chỉ chứa số, 6 chữ số)
    let bookingID, bookingCode;
    let isUnique = false;
    while (!isUnique) {
      const randomSixDigits = generateRandomSixDigitNumber();
      bookingID = `BID-${randomSixDigits}`; // Ví dụ: BID-123456
      bookingCode = `BCODE-${randomSixDigits}`; // Ví dụ: BCODE-123456
      const existingBooking = await Booking.findOne({
        $or: [{ BookingID: bookingID }, { BookingCode: bookingCode }],
      });
      if (!existingBooking) {
        isUnique = true;
      }
    }

    const newBooking = new Booking({
      BookingID: bookingID,
      BookingCode: bookingCode,
      username,
      customerName,
      customerEmail,
      customerPhone,
      notes,
      service_id,
      serviceName: service.name,
      serviceType: service.category?.name,
      bookingDate,
      startTime,
      endTime,
      duration: service.duration,
      originalPrice,
      totalPrice: finalPrice,
      discountedPrice,
      currency: "VND",
      Skincare_staff: Skincare_staff,
      status: "pending",
      description,
    });

    await newBooking.save();
    console.log("📌 Booking successful:", newBooking);

    await sendOrderConfirmationEmail(customerEmail, newBooking);

    res.status(201).json({
      message: "Booking successful! A confirmation email has been sent.",
      booking: newBooking,
    });
  } catch (error) {
    console.error("📌 Error creating booking:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate booking code or ID detected. Please try again!",
        error: error.message,
      });
    }
    res.status(500).json({ message: "Error creating booking!", error: error.message });
  }
};

// Get all bookings (for staff)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving booking list!", error: error.message });
  }
};

// Get bookings by username (for customers)
exports.getBookingsByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const decodedUsername = decodeURIComponent(username);
    const bookings = await Booking.find({ username: decodedUsername });

    if (!bookings.length) {
      return res.status(404).json({ message: "No bookings found!" });
    }

    // console.log("📌 Orders Data from DB:", bookings);

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error retrieving bookings by username:", error);
    res.status(500).json({ message: "Error retrieving bookings!", error: error.message });
  }
};

// Get bookings by therapist (for therapists)
exports.getBookingsByTherapist = async (req, res) => {
  try {
    const { username } = req.params;
    const decodedUsername = decodeURIComponent(username);
    const bookings = await Booking.find({ Skincare_staff: decodedUsername });

    if (!bookings.length) {
      return res.status(404).json({ message: "No bookings found!" });
    }

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error retrieving bookings by therapist:", error);
    res.status(500).json({ message: "Error retrieving bookings!", error: error.message });
  }
};

// Get booking by BookingID
exports.getBookingById = async (req, res) => {
  try {
    const { bookingID } = req.params;
    const booking = await Booking.findOne({ BookingID: bookingID }).populate(
      "userId",
      "username email"
    );
    if (!booking) return res.status(404).json({ message: "Booking not found!" });
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving booking!", error: error.message });
  }
};

// Delete booking by BookingID
exports.deleteBooking = async (req, res) => {
  try {
    const { bookingID } = req.params;
    const deletedBooking = await Booking.findOneAndDelete({ BookingID: bookingID });
    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found!" });
    }
    res.status(200).json({ message: "Booking deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting booking!", error: error.message });
  }
};

// Update booking by BookingID (supports "completed" and "checked-out")
exports.updateBooking = async (req, res) => {
  try {
    const { bookingID } = req.params;
    const { status, Skincare_staff, description } = req.body;

    const booking = await Booking.findOne({ BookingID: bookingID });
    if (!booking) return res.status(404).json({ message: "Booking not found!" });

    if (description !== undefined) {
      booking.description = description;
    }

    // Status transition validation
    if (status === "checked-in" && booking.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Can only check-in from 'pending' status!" });
    }
    if (status === "completed" && booking.status !== "checked-in") {
      return res
        .status(400)
        .json({ message: "Can only complete from 'checked-in' status!" });
    }
    if (status === "checked-out" && booking.status !== "completed") {
      return res
        .status(400)
        .json({ message: "Can only check-out from 'completed' status!" });
    }
    if (status === "cancel" && booking.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Can only cancel from 'pending' status!" });
    }

    if (Skincare_staff !== undefined) booking.Skincare_staff = Skincare_staff;
    if (status) booking.status = status;

    await booking.save();
    res.status(200).json({ message: "Booking updated successfully!", booking });
  } catch (error) {
    res.status(500).json({ message: "Error updating booking!", error: error.message });
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
      status: { $in: ["pending", "checked-in", "completed", "checked-out", "reviewed"] },
    };

    if (date) {
      query.bookingDate = date;
    }

    const bookedSlots = await Booking.find(query)
      .select("startTime endTime bookingDate")
      .sort({ bookingDate: 1, startTime: 1 })
      .lean();

    res.status(200).json(bookedSlots);
  } catch (error) {
    console.error("Error retrieving slots:", error);
    res.status(500).json({ message: "Error retrieving slots!", error: error.message });
  }
};

// Cập nhật trạng thái booking
exports.updateBookingStatus = async (req, res) => {
  try {
    const { paymentID, status } = req.body;

    if (!paymentID || !status) {
      return res.status(400).json({
        error: -1,
        message: "Missing paymentID or status",
      });
    }

    const updatedBookings = await Booking.updateMany(
      { paymentID, status: "completed" },
      { status, updatedAt: Date.now() }
    );

    if (updatedBookings.matchedCount === 0) {
      return res.status(404).json({
        error: -1,
        message: `No bookings found with paymentID ${paymentID} and status 'completed'`,
      });
    }

    return res.json({
      error: 0,
      message: "Booking status updated successfully",
      data: updatedBookings,
    });
  } catch (error) {
    console.error("Update Booking Status Error:", error);
    return res.status(500).json({
      error: -1,
      message: "Failed to update booking status",
      details: error.message,
    });
  }
};