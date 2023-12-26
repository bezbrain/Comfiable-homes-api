const express = require("express");
const connectDB = require("./db/connect");
require("dotenv").config();
require("express-async-errors");
const NotFoundMiddleware = require("./middleware/not-found");
const ErrorHandlerMiddleware = require("./middleware/error-handler");
const authRouter = require("./routes/auth.route");
const productRouter = require("./routes/products.route");
const authMiddleware = require("./middleware/auth");

const app = express();

// Use this middleware to make sure that the body is available on req.body
app.use(express.json());

app.get("/", (req, res) => {
  res.send("This is the home page");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", authMiddleware, productRouter);

app.use(NotFoundMiddleware);
app.use(ErrorHandlerMiddleware);

// The dynamic port
const port = process.env.PORT || 3000;

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
