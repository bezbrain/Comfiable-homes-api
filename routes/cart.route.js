const express = require("express");
const router = express.Router();

const {
  addToCart,
  getCartItems,
  deleteFromCart,
  deleteAll,
} = require("../controllers/cart.controller");

router.post("/addToCart", addToCart);
router.get("/getCartItems", getCartItems);
router.delete("/deleteCart/:itemId", deleteFromCart);
router.delete("/deleteAll", deleteAll);

module.exports = router;
