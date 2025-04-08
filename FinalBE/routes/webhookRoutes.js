const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const Cart = require("../models/cartModel");

router.post("/receive-hook", async (req, res) => {
  try {
    const { code, desc, data } = req.body;

    console.log("Received Webhook:", req.body);

    if (code !== "00" || desc !== "success" || !data?.orderCode) {
      return res.status(400).json({
        error: -1,
        message: "Invalid webhook data",
      });
    }

    const orderCode = data.orderCode;

    // Tìm Payment
    const payment = await Payment.findOneAndUpdate(
      { orderCode },
      { status: "checked-out" },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        error: -1,
        message: "Order not found",
      });
    }

    const orderName = payment.orderName;

    // Cập nhật các Cart có serviceName trùng với orderName
    const updatedCarts = await Cart.updateMany(
      { serviceName: orderName, status: "completed" },
      { $set: { status: "checked-out" } }
    );

    return res.json({
      error: 0,
      message: "Payment and cart status updated",
      data: {
        payment,
        updatedCartCount: updatedCarts.modifiedCount,
      },
    });
  } catch (error) {
    console.error("Webhook Error:", error);
    return res.status(500).json({
      error: -1,
      message: "Server error",
    });
  }
});


module.exports = router;
