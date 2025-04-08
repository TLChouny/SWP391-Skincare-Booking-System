const mongoose = require("mongoose");
const PayOS = require("@payos/node");
const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const { updateBookingStatus } = require("./bookingController");

// Khởi tạo PayOS với thông tin từ .env
let payOS;
try {
  payOS = new PayOS(
    process.env.PAYOS_CLIENT_ID,
    process.env.PAYOS_API_KEY,
    process.env.PAYOS_CHECKSUM_KEY
  );
  console.log("PayOS initialized successfully");
} catch (error) {
  console.error("Failed to initialize PayOS:", error.message || error);
  throw new Error("PayOS initialization failed");
}

// Tạo link thanh toán
const createPaymentLink = async (req, res) => {
  try {
    const { amount, orderName, description, returnUrl, cancelUrl, bookingIds } = req.body;

    if (!bookingIds || bookingIds.length === 0) {
      return res.status(400).json({ error: -1, message: "No bookingIds provided" });
    }

    const truncatedDescription = description.length > 25 ? description.substring(0, 25) : description;
    const body = {
      amount,
      description: truncatedDescription,
      orderCode: Math.floor(100000 + Math.random() * 900000),
      returnUrl,
      cancelUrl,
    };

    const payOSResponse = await payOS.createPaymentLink(body);
    const orderCode = String(payOSResponse.orderCode); // Đảm bảo orderCode là Number
    const paymentID = `PAY${orderCode}`;

    const newPayment = new Payment({
      paymentID,
      orderName,
      amount,
      description: truncatedDescription,
      status: "pending",
      returnUrl,
      cancelUrl,
      orderCode,
      checkoutUrl: payOSResponse.checkoutUrl,
      qrCode: payOSResponse.qrCode,
    });

    await newPayment.save();
    console.log("Saved Payment:", newPayment);

    const updatedBookings = await Booking.updateMany(
      { BookingID: { $in: bookingIds }, status: "completed" },
      { $set: { paymentID } }
    );
    console.log(`Updated ${updatedBookings.modifiedCount} bookings with paymentID: ${paymentID}`);

    if (updatedBookings.modifiedCount === 0) {
      console.log("No bookings updated. Check bookingIds or status.");
    }

    return res.json({
      error: 0,
      message: "Payment link created successfully",
      data: {
        checkoutUrl: payOSResponse.checkoutUrl,
        qrCode: payOSResponse.qrCode,
        orderCode,
      },
    });
  } catch (error) {
    console.error("Error creating payment link:", error);
    return res.status(500).json({
      error: -1,
      message: "Failed to create payment link",
      details: error.message,
    });
  }
};
// Lấy thông tin thanh toán theo orderCode
const getPaymentByOrderCode = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        error: -1,
        message: "Missing orderId",
        data: null,
      });
    }

    const payment = await Payment.findOne({ orderCode: orderId });
    if (!payment) {
      return res.status(404).json({
        error: -1,
        message: "Order not found",
        data: null,
      });
    }

    return res.json({
      error: 0,
      message: "Order retrieved",
      data: payment,
    });
  } catch (error) {
    console.error("Get Order Error:", error.message || error);
    return res.status(500).json({
      error: -1,
      message: "Failed to fetch order",
      data: null,
    });
  }
};

// Cập nhật trạng thái thanh toán theo orderCode
const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { orderCode } = req.params;

    if (!status || !["pending", "success", "failed", "cancelled"].includes(status)) {
      return res.status(400).json({
        error: -1,
        message: "Invalid status",
      });
    }

    if (!orderCode) {
      return res.status(400).json({
        error: -1,
        message: "Missing orderCode",
      });
    }

    const updatedPayment = await Payment.findOneAndUpdate(
      { orderCode },
      { status },
      { new: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({
        error: -1,
        message: "Order not found",
      });
    }

    if (status === "success") {
      const paymentID = updatedPayment.paymentID;
      const updateResult = await updateBookingStatus(
        { body: { paymentID, status: "checked-out" } },
        { json: () => {} }
      );

      if (updateResult.error === -1) {
        console.warn(`Failed to update booking status for paymentID ${paymentID}: ${updateResult.message}`);
      } else {
        console.log(`Booking with paymentID ${paymentID} updated to checked-out`);
      }
    }

    return res.json({
      error: 0,
      message: "Payment status updated successfully",
      data: updatedPayment,
    });
  } catch (error) {
    console.error("Update Payment Status Error:", error.message || error);
    return res.status(500).json({
      error: -1,
      message: "Failed to update payment status",
      data: error.message || "Unknown error",
    });
  }
};

// Lấy thông tin tất cả thanh toán
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find();
    return res.json({
      error: 0,
      message: "All payments retrieved",
      data: payments,
    });
  } catch (error) {
    console.error("Get All Payments Error:", error.message || error);
    return res.status(500).json({
      error: -1,
      message: "Failed to fetch payments",
      data: null,
    });
  }
};

// Kiểm tra trạng thái thanh toán qua PayOS
// const checkPaymentStatus = async (req, res) => {
//   try {
//     const { orderCode } = req.params;

//     if (!orderCode) {
//       return res.status(400).json({
//         error: -1,
//         message: "Missing orderCode",
//       });
//     }

//     const paymentData = await payOS.getPaymentLinkInformation(orderCode);
//     console.log("PayOS Payment Data:", paymentData);

//     if (!paymentData || !paymentData.status) {
//       throw new Error("Invalid PayOS response: Missing status");
//     }

//     const paymentStatus = paymentData.status === "PAID" ? "success" : paymentData.status.toLowerCase();
//     const payment = await Payment.findOneAndUpdate(
//       { orderCode },
//       { status: paymentStatus },
//       { new: true }
//     );

//     if (!payment) {
//       console.warn(`Payment with orderCode ${orderCode} not found`);
//     }

//     if (paymentData.status === "PAID") {
//       const paymentID = payment ? payment.paymentID : `PAY${orderCode}`;
//       const updateResult = await updateBookingStatus(
//         { body: { paymentID, status: "checked-out" } },
//         { json: () => {} }
//       );
//       console.log("Booking Update Result:", updateResult);
//     }

//     return res.json({
//       error: 0,
//       message: "Payment status retrieved successfully",
//       data: {
//         status: paymentData.status,
//         paymentID: payment ? payment.paymentID : null,
//         orderCode,
//       },
//     });
//   } catch (error) {
//     console.error("Check Payment Status Error:", error.message || error);
//     return res.status(500).json({
//       error: -1,
//       message: "Failed to check payment status",
//       data: error.message || "Unknown error",
//     });
//   }
// };

// Xử lý webhook từ PayOS (Phiên bản thứ nhất)
// const handlePaymentWebhook = async (req, res) => {
//   try {
//     const { code, desc, data } = req.body;

//     console.log("Received Webhook:", req.body);

//     if (code !== "00" || desc !== "success" || !data?.orderCode) {
//       return res.status(400).json({
//         error: -1,
//         message: "Invalid webhook data",
//       });
//     }

//     const orderCode = data.orderCode;

//     // Tìm Payment
//     const payment = await Payment.findOne({ orderCode });
//     console.log("Found Payment with orderCode:", payment);

//     if (!payment) {
//       console.log(`Payment with orderCode ${orderCode} not found`);
//       return res.status(404).json({
//         error: -1,
//         message: "Order not found",
//       });
//     }

//     // Cập nhật trạng thái Payment
//     payment.status = "checked-out";
//     await payment.save();
//     console.log("Updated Payment:", payment);

//     const paymentID = payment.paymentID;

//     // Tìm và cập nhật các Booking dựa trên paymentID
//     const bookingsByPaymentID = await Booking.find({
//       paymentID,
//       status: "completed",
//     });
//     console.log("Bookings found by paymentID:", bookingsByPaymentID);

//     const updatedBookings = await Booking.updateMany(
//       { paymentID, status: "completed" },
//       { $set: { status: "checked-out" } }
//     );

//     if (updatedBookings.modifiedCount === 0) {
//       console.log(`No bookings updated for paymentID ${paymentID}. Check paymentID and status.`);
//     }

//     return res.json({
//       error: 0,
//       message: "Payment and Booking status updated",
//       data: {
//         payment,
//         updatedBookingCount: updatedBookings.modifiedCount,
//       },
//     });
//   } catch (error) {
//     console.error("Webhook Error:", error.message || error);
//     return res.status(500).json({
//       error: -1,
//       message: "Server error",
//       data: error.message || "Unknown error",
//     });
//   }
// };

module.exports = {
  createPaymentLink,
  getPaymentByOrderCode,
  updatePaymentStatus,
  getAllPayments,
  // checkPaymentStatus,
  // handlePaymentWebhook,
};