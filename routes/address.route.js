const express = require("express");
const router = express.Router();

const {
  createAddress,
  getAddress,
} = require("../controllers/address.controller");

router.post("/address", createAddress);
router.get("/address", getAddress);

module.exports = router;
