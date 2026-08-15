export {};

declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    MONGO_URI?: string;
    JWT_SECRET?: string;
    JWT_LIFETIME?: string;
    PAYSTACK_SECRET_KEY?: string;
    PAYSTACK_BASE_URL?: string;
  }
}
