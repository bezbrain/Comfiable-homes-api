const express = require("express");
const router = express.Router();

const {
  getAllProducts,
  singleProduct,
} = require("../controllers/products.controller");

router.get("/products", getAllProducts);
router.get("/products/:itemId", singleProduct);

module.exports = router;
