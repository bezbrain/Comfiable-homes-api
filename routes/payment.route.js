const express = require("express");
const router = express.Router();

const {
  acceptPayment,
  paymentWebhook,
  paymentCallback,
} = require("../controllers/payment.controller");

router.post("/acceptPayment", acceptPayment);
router.post("/paystack/webhook", paymentWebhook);
router.post("/paystack/paymentCallback", paymentCallback);

module.exports = router;
