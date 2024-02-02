const express = require("express");
const connectDB = require("./db/connect");
require("dotenv").config();
require("express-async-errors");

const timeout = require("connect-timeout");

// Security
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

// Swagger
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocs = YAML.load("./swagger.yaml");

const NotFoundMiddleware = require("./middleware/not-found");
const ErrorHandlerMiddleware = require("./middleware/error-handler");
const authRouter = require("./routes/auth.route");
const productRouter = require("./routes/products.route");
const cartRouter = require("./routes/cart.route");
const cartControllerRouter = require("./routes/cartController.route");
const addressRouter = require("./routes/address.route");
const paymentRouter = require("./routes/payment.route");
const authMiddleware = require("./middleware/auth");
const timeoutMiddleware = require("./middleware/timeout");

const app = express();

// Timeout middleware
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

// Use this middleware to make sure that the body is available on req.body
app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h2>Home page</h2><a href='/comfiable-homes-docs'>Go To Docs</a>");
});

// Serve the docs
app.use("/comfiable-homes-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1", productRouter);
app.use("/api/v1", authMiddleware, cartRouter);
app.use("/api/v1", authMiddleware, cartControllerRouter);
app.use("/api/v1/checkout", authMiddleware, addressRouter);
app.use("/api/v1", authMiddleware, paymentRouter);

app.use(NotFoundMiddleware);
app.use(ErrorHandlerMiddleware);

// The dynamic port
const port = process.env.PORT || 3007;

// Connect to DB
const startDB = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, console.log(`Server is listening on port ${port}`));
  } catch (error) {
    console.log(error);
  }
};

startDB();
