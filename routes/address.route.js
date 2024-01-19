const express = require("express");
const router = express.Router();

const {
  createAddress,
  getAddress,
  updateAddress,
} = require("../controllers/address.controller");

router.post("/address", createAddress);
router.get("/address", getAddress);
router.patch("/address", updateAddress);

module.exports = router;
