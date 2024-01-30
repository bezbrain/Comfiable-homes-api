const express = require("express");
const router = express.Router();

const { acceptPayment } = require("../controllers/payment.controller");

router.post("/acceptPayment", acceptPayment);

module.exports = router;
