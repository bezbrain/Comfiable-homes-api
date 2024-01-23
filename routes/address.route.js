const express = require("express");
const router = express.Router();

const {
  createAddress,
  getAddress,
  updateAddress,
  checkForAddress,
} = require("../controllers/address.controller");

router.post("/address", createAddress);
router.get("/address", getAddress);
router.patch("/address", updateAddress);
router.get("/checkAddress", checkForAddress);

module.exports = router;
