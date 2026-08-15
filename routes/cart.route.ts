import express from "express";
import {
  addToCart,
  getCartItems,
  deleteFromCart,
  deleteAll,
} from "../controllers/cart.controller";

const router = express.Router();

router.post("/addToCart", addToCart);
router.get("/getCartItems", getCartItems);
router.delete("/deleteCart/:itemId", deleteFromCart);
router.delete("/deleteAll", deleteAll);

export default router;
