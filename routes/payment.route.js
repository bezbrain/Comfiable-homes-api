const express = require("express");
const router = express.Router();

const {
  acceptPayment,
  paymentWebhook,
} = require("../controllers/payment.controller");

router.post("/acceptPayment", acceptPayment);
router.post("/paystack/webhook", paymentWebhook);

module.exports = router;
