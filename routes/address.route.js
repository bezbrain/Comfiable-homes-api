const express = require("express");
const { createAddress } = require("../controllers/address.controller");
const router = express.Router();

router.post("/address", createAddress);

module.exports = router;
