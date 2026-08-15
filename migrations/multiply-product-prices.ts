import dotenv from "dotenv";
import connectDB, { disconnectDB } from "../db/connect";
import ProductCollection from "../models/Product";

dotenv.config();

const PRICE_MULTIPLIER = 1500;
const ALREADY_MIGRATED_MIN_PRICE = 10000;

const start = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set");
  }

  await connectDB(process.env.MONGO_URI);

  const cheapest = await ProductCollection.findOne().sort({ price: 1 }).select("price");
  if (!cheapest) {
    console.log("No products found. Nothing to migrate.");
    await disconnectDB();
    process.exit(0);
  }

  if (cheapest.price >= ALREADY_MIGRATED_MIN_PRICE) {
    console.log(
      `Skipping: lowest product price is already ${cheapest.price}. Migration looks applied.`
    );
    await disconnectDB();
    process.exit(0);
  }

  const result = await ProductCollection.updateMany({}, { $mul: { price: PRICE_MULTIPLIER } });

  console.log(
    `Updated ${result.modifiedCount} product price(s) by ×${PRICE_MULTIPLIER}.`
  );

  await disconnectDB();
  process.exit(0);
};

start().catch(async (error) => {
  console.error(error);
  await disconnectDB();
  process.exit(1);
});
