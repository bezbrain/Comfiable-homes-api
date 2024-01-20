const express = require("express");
const router = express.Router();

const {
  cartIncrease,
  cartDecrease,
} = require("../controllers/cartCont.controller");

router.get("/increaseItem/:itemId", cartIncrease);
router.get("/decreaseItem/:itemId", cartDecrease);

module.exports = router;
