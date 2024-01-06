const express = require("express");
const router = express.Router();

const {
  addToCart,
  getCartItems,
  deleteFromCart,
} = require("../controllers/cart.controller");

router.post("/addToCart", addToCart);
router.get("/getCartItems", getCartItems);
router.get("/deleteCart/:itemId", deleteFromCart);

module.exports = router;
