require("dotenv").config();

const config = {
  paystackSecret: process.env.PAYSTACK_SECRET_KEY,
  paystackBaseUrl: process.env.PAYSTACK_BASE_URL,
};

module.exports = config;
