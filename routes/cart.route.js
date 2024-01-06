const express = require("express");
const router = express.Router();

const { addToCart, getItems } = require("../controllers/cart.controller");

router.post("/addToCart", addToCart);
router.get("/getItems", getItems);

module.exports = router;
