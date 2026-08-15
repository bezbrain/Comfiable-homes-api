import express from "express";
import {
  paymentWebhook,
  paymentCallback,
} from "../controllers/payment.controller";

const router = express.Router();

// Paystack calls these itself, so there is no user token.
router.post("/webhook", paymentWebhook);
router.get("/paystack/paymentCallback", paymentCallback);

export default router;
