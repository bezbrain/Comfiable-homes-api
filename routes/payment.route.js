const express = require("express");
const router = express.Router();

const {
  acceptPayment,
  paymentCallback,
} = require("../controllers/payment.controller");

router.post("/acceptPayment", acceptPayment);
router.post("/paystack/callback", paymentCallback);

module.exports = router;
