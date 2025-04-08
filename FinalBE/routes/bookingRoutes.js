const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController"); // Thay cartController thành bookingController
const { authMiddleware, authorize } = require("../middleware/auth");

// Định nghĩa các route
router.post("/",authMiddleware, bookingController.createBooking); // Thay createCart thành createBooking
router.get("/", bookingController.getAllBookings); // Thay getAllCarts thành getAllBookings
router.get("/booked-slots", bookingController.getBookedSlots); // Thay cart/booked-slots thành booking/booked-slots, getBookedSlots không đổi

router.get("/:bookingID", bookingController.getBookingById); // Thay cartID thành bookingID, getCartById thành getBookingById
router.get("/user/:username", bookingController.getBookingsByUsername); // Thay getCartsByUsername thành getBookingsByUsername
router.get("/therapist/:username", bookingController.getBookingsByTherapist); // Thay getCartsByTherapist thành getBookingsByTherapist
router.put("/update-status", authMiddleware, bookingController.updateBookingStatus);
router.put("/:bookingID", bookingController.updateBooking); // Thay cartID thành bookingID, updateCart thành updateBooking
router.delete("/:bookingID", bookingController.deleteBooking); // Thay cartID thành bookingID, deleteCart thành deleteBooking
module.exports = router;