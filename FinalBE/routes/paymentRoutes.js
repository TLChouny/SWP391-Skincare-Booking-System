const express = require("express");
const router = express.Router();
const {
  createPaymentLink,
  getPaymentByOrderCode,
  updatePaymentStatus,
  getAllPayments,
  // checkPaymentStatus,
  // handlePaymentWebhook,
} = require("../controllers/paymentController");

router.post("/create-payment-link", createPaymentLink);
router.get("/order/:orderId", getPaymentByOrderCode);
router.put("/order/:orderCode", updatePaymentStatus);
router.get("/all", getAllPayments);
// router.get("/check/:orderCode", checkPaymentStatus);
// router.post("/webhook", handlePaymentWebhook);

module.exports = router;