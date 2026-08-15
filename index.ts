import express, { Request, Response } from "express";
import connectDB, { disconnectDB } from "./db/connect";
import dotenv from "dotenv";
import "express-async-errors";

import timeout from "connect-timeout";

import helmet from "helmet";
import cors from "cors";
import xss from "xss-clean";
// import rateLimiter from "express-rate-limit";

import swaggerUI from "swagger-ui-express";
import YAML from "yamljs";
import NotFoundMiddleware from "./middleware/not-found";
import ErrorHandlerMiddleware from "./middleware/error-handler";
import authRouter from "./routes/auth.route";
import productRouter from "./routes/products.route";
import cartRouter from "./routes/cart.route";
import cartControllerRouter from "./routes/cartController.route";
import addressRouter from "./routes/address.route";
import paymentRouter from "./routes/payment.route";
import paymentPublicRouter from "./routes/paymentPublic.route";
import ordersRouter from "./routes/orders.route";
import newsletterRouter from "./routes/newsletter.route";
import statsRouter from "./routes/stats.route";
import authMiddleware from "./middleware/auth";
import timeoutMiddleware from "./middleware/timeout";
import config from "./config/config";

dotenv.config();

const swaggerDocs = YAML.load("./swagger.yaml");

const app = express();

app.use(timeout("10s"));
app.use(timeoutMiddleware);

// app.use(
//   rateLimiter({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
//     standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
//     legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
//     // store: ... , // Use an external store for consistency across multiple server instances.
//   })
// );
app.use(helmet());
app.use(cors());
app.use(xss());

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("<h2>Home page</h2><a href='/comfiable-homes-docs'>Go To Docs</a>");
});

app.use("/comfiable-homes-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1", productRouter);
app.use("/api/v1", newsletterRouter);
app.use("/api/v1", authMiddleware, statsRouter);
app.use("/api/v1", authMiddleware, cartRouter);
app.use("/api/v1", authMiddleware, cartControllerRouter);
app.use("/api/v1/checkout", authMiddleware, addressRouter);
// Webhook first, and without auth — Paystack cannot send a user JWT.
app.use("/api/v1", paymentPublicRouter);
app.use("/api/v1", authMiddleware, paymentRouter);
app.use("/api/v1", authMiddleware, ordersRouter);

app.use(NotFoundMiddleware);
app.use(ErrorHandlerMiddleware);

const port = process.env.PORT || 3007;

const startDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not set");
    }
    await connectDB(process.env.MONGO_URI as string);
    const server = app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
      if (config.resendApiKey) {
        console.log("Email will send via Resend HTTPS");
      } else if (config.emailUser && config.emailPass) {
        console.log(
          `Email will send via Gmail SMTP for ${config.emailUser}. Render free web services block SMTP; set RESEND_API_KEY for production.`
        );
      } else {
        console.warn(
          "Email is not configured. Set RESEND_API_KEY (Render) or EMAIL_USER and EMAIL_PASS (local)."
        );
      }
    });

    const shutdown = async () => {
      server.close();
      await disconnectDB();
      process.exit(0);
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    console.log(error);
  }
};

startDB();
