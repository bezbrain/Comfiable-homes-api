import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const emailUser = process.env.EMAIL_USER?.trim();
const emailPass = process.env.EMAIL_PASS?.replace(/\s/g, "");

const config = {
  paystackSecret: process.env.PAYSTACK_SECRET_KEY,
  // Hostname only, e.g. api.paystack.co
  paystackBaseUrl: process.env.PAYSTACK_BASE_URL || "api.paystack.co",
  // Where Paystack should send the shopper after they pay.
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  // Keep this in sync with the checkout shipping fee on the frontend.
  shippingFee: 8010,
  emailUser,
  emailPass,
  emailFrom: process.env.EMAIL_FROM?.trim() || emailUser,
  resendApiKey: process.env.RESEND_API_KEY?.trim(),
  resendFrom:
    process.env.RESEND_FROM?.trim() ||
    process.env.EMAIL_FROM?.trim() ||
    "ComfiableHomes <hello@dezxi.com>",
  emailReplyTo:
    process.env.EMAIL_REPLY_TO?.trim() ||
    emailUser ||
    "comfiablehomes@gmail.com",
};

export default config;
