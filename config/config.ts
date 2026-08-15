import dotenv from "dotenv";

dotenv.config();

const config = {
  paystackSecret: process.env.PAYSTACK_SECRET_KEY,
  // Hostname only, e.g. api.paystack.co
  paystackBaseUrl: process.env.PAYSTACK_BASE_URL || "api.paystack.co",
  // Where Paystack should send the shopper after they pay.
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  // Keep this in sync with the checkout shipping fee on the frontend.
  shippingFee: 8010,
};

export default config;
