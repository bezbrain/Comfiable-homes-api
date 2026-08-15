import { Request, Response } from "express";
import { FilterQuery } from "mongoose";
import NotFoundError from "../errors/not-found";
import ProductCollection, { IProduct } from "../models/Product";
import { StatusCodes } from "http-status-codes";

const getAllProducts = async (req: Request, res: Response) => {
  const { category, search, sort, brand, maxPrice, featured } = req.query;

  if (featured === "true") {
    return getFeaturedProducts(req, res);
  }

  const queryObject: FilterQuery<IProduct> = {};

  if (category && category !== "All") {
    queryObject.category = String(category);
  }

  if (search) {
    queryObject.type = { $regex: String(search), $options: "i" };
  }

  if (brand && brand !== "All") {
    queryObject.brand = String(brand);
  }

  if (maxPrice) {
    queryObject.price = {};
    queryObject.price.$lte = parseFloat(String(maxPrice));
  }

  let result = ProductCollection.find(queryObject);

  if (sort) {
    result = result.sort(String(sort));
  } else {
    result = result.sort("createdAt");
  }

  const page = Math.max(1, parseInt(String(req.query.page || "1"), 10) || 1);
  const limit = Math.min(
    48,
    Math.max(1, parseInt(String(req.query.limit || "9"), 10) || 9)
  );
  const skip = (page - 1) * limit;
  const total = await ProductCollection.countDocuments(queryObject);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const products = await result.skip(skip).limit(limit);

  res.status(StatusCodes.OK).json({
    success: true,
    count: products.length,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    message: "All products",
    products,
  });
};

const singleProduct = async (req: Request, res: Response) => {
  const {
    params: { itemId },
  } = req;
  const products = await ProductCollection.findOne({ _id: itemId });

  if (!products) {
    throw new NotFoundError(`Item with the id ${itemId} not found`);
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Item fetched",
    products,
  });
};

const getFeaturedProducts = async (_req: Request, res: Response) => {
  const products = await ProductCollection.aggregate([
    { $sample: { size: 3 } },
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    count: products.length,
    message: "Featured products",
    products,
  });
};

export { getAllProducts, singleProduct, getFeaturedProducts };
