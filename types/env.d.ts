export {};

declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    MONGO_URI?: string;
    JWT_SECRET?: string;
    JWT_LIFETIME?: string;
    PAYSTACK_SECRET_KEY?: string;
    PAYSTACK_BASE_URL?: string;
    FRONTEND_URL?: string;
    EMAIL_USER?: string;
    EMAIL_PASS?: string;
    EMAIL_FROM?: string;
    RESEND_API_KEY?: string;
  }
}
