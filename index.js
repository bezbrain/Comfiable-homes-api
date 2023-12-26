const express = require("express");
const connectDB = require("./db/connect");
const NotFoundMiddleware = require("./middleware/not-found");
const ErrorHandlerMiddleware = require("./middleware/error-handler");
require("dotenv").config();
require("express-async-errors");

const app = express();

// Use this middleware to make sure that the body is available on req.body
app.use(express.json());

app.get("/", (req, res) => {
  res.send("This is the home page");
});

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
