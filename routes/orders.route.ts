import express from "express";
import {
  completeOrder,
  getAdminOrders,
  getOrders,
  getSingleOrder,
} from "../controllers/orders.controller";

const router = express.Router();

router.get("/getOrders", getOrders);
router.get("/admin/orders", getAdminOrders);
router.get("/getOrder/:orderId", getSingleOrder);
router.patch("/completeOrder/:orderId", completeOrder);

export default router;
