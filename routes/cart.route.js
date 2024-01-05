const express = require("express");
const router = express.Router();

const { addToCart } = require("../controllers/cart.controller");

router.post("/cart", addToCart);

module.exports = router;
