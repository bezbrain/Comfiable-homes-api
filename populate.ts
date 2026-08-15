import connectDB from "./db/connect";
import dotenv from "dotenv";
import ProductCollection from "./models/Product";
import productData from "./products.json";

dotenv.config();

const startDB = async () => {
  try {
    await connectDB(process.env.MONGO_URI as string);
    await ProductCollection.deleteMany();
    await ProductCollection.create(productData);
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

startDB();
