const express = require("express");
const router = express.Router();

const {
  acceptPayment,
  paymentCallback,
} = require("../controllers/payment.controller");

router.post("/acceptPayment", acceptPayment);
router.get("/paystack/callback", paymentCallback);

module.exports = router;
