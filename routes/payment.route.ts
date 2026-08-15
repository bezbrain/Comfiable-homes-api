import express from "express";
import {
  acceptPayment,
  paymentWebhook,
  paymentCallback,
} from "../controllers/payment.controller";

const router = express.Router();

router.post("/acceptPayment", acceptPayment);
router.post("/webhook", paymentWebhook);
router.get("/paystack/paymentCallback", paymentCallback);

export default router;
