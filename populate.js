const express = require("express");
const connectDB = require("./db/connect");
require("dotenv").config();

const ProductCollection = require("./models/Product");

const productData = require("./products.json");

const app = express();

const port = process.env.PORT || 3000;

const startDB = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    await ProductCollection.deleteMany();
    await ProductCollection.create(productData);
    // app.listen(port, console.log(`Server is listening on port ${port}`));
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
startDB();
