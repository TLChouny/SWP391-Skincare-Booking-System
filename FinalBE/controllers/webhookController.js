const Payment = require("../models/Payment");
const Booking = require("../models/Booking");

const handlePaymentWebhook = async (req, res) => {
  try {
    const { code, success, data, desc } = req.body;

    console.log("✅ Webhook Received:", req.body);

    // Kiểm tra tính hợp lệ của webhook
    if (code !== "00" || !success || desc !== "success" || !data?.orderCode) {
      return res.status(400).json({
        error: -1,
        message: "Invalid webhook data",
      });
    }

    const orderCode = Number(data.orderCode);
    if (isNaN(orderCode)) {
      console.warn(`⚠️ Invalid orderCode: ${data.orderCode}`);
      return res.status(400).json({
        error: -1,
        message: "Invalid orderCode format",
      });
    }

    // Tìm payment theo orderCode
    const payment = await Payment.findOne({ orderCode });
    if (!payment) {
      console.warn(`❌ Payment with orderCode ${orderCode} not found`);
      return res.status(404).json({
        error: -1,
        message: "Payment not found",
      });
    }

    // Nếu payment đã success thì không làm lại
    if (payment.status === "success") {
      console.log(`✅ Payment ${orderCode} already marked as success`);
      return res.json({
        error: 0,
        message: "Payment already processed",
        data: { payment, updatedBookingCount: 0 },
      });
    }

    // Cập nhật trạng thái payment
    payment.status = "success";
    payment.updatedAt = new Date();
    await payment.save();
    console.log(`✅ Payment ${payment.paymentID} marked as success`);

    // Tìm và cập nhật các booking liên quan
    const paymentID = payment.paymentID;
    if (!paymentID) {
      return res.status(400).json({
        error: -1,
        message: "Missing paymentID in payment document",
      });
    }

    const bookingsToUpdate = await Booking.find({
      paymentID,
      status: "completed",
    });

    if (bookingsToUpdate.length === 0) {
      console.log(`ℹ️ No bookings to update with paymentID: ${paymentID}`);
      return res.status(200).json({
        error: 0,
        message: "Payment updated, but no bookings were eligible for status update",
        data: {
          payment,
          updatedBookingCount: 0,
        },
      });
    }

    const updated = await Booking.updateMany(
      { paymentID, status: "completed" },
      { $set: { status: "checked-out", updatedAt: new Date() } }
    );


    console.log(`✅ Updated ${updated.modifiedCount} bookings to 'checked-out'`);

    return res.json({
      error: 0,
      message: "Payment and bookings updated successfully",
      data: {
        payment,
        updatedBookingCount: updated.modifiedCount,
      },
    });
  } catch (error) {
    console.error("❌ Webhook error:", error.message || error);
    return res.status(500).json({
      error: -1,
      message: "Server error",
      data: error.message || "Unknown error",
    });
  }
};

const handleWebhook = (req, res) => {
  res.status(200).json({
      message: "Webhook endpoint is active",
      timestamp: new Date().toISOString(),
      status: "OK",
  });
};

module.exports = { handlePaymentWebhook, handleWebhook };