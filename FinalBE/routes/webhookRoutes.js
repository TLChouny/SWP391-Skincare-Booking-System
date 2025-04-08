const express = require("express");
const router = express.Router();
const { handlePaymentWebhook, handleWebhook } = require("../controllers/webhookController");

router.post("/receive-hook", handlePaymentWebhook);
router.get("/receive-hook-get", handleWebhook);

module.exports = router;