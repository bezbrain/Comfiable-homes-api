import express from "express";
import {
  getAllProducts,
  singleProduct,
} from "../controllers/products.controller";

const router = express.Router();

router.get("/products", getAllProducts);
router.get("/products/:itemId", singleProduct);

export default router;
