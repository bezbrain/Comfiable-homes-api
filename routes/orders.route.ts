import express from "express";
import { getOrders, getSingleOrder } from "../controllers/orders.controller";

const router = express.Router();

router.get("/getOrders", getOrders);
router.get("/getOrder/:orderId", getSingleOrder);

export default router;
