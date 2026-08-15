import express from "express";
import { acceptPayment, verifyPayment } from "../controllers/payment.controller";

const router = express.Router();

// These need a logged-in shopper (JWT).
router.post("/acceptPayment", acceptPayment);
router.get("/verifyPayment/:reference", verifyPayment);

export default router;
