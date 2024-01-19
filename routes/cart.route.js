const express = require("express");
const router = express.Router();

const {
  addToCart,
  getCartItems,
  deleteFromCart,
  deleteAll,
  cartIncrease,
  cartDecrease,
} = require("../controllers/cart.controller");

router.post("/addToCart", addToCart);
router.get("/getCartItems", getCartItems);
router.delete("/deleteCart/:itemId", deleteFromCart);
router.delete("/deleteAll", deleteAll);

// Increasers
router.get("/increaseItem/:itemId", cartIncrease);
router.get("/decreaseItem/:itemId", cartDecrease);

module.exports = router;
