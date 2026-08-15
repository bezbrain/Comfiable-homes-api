import { Request, Response } from "express";
import { FilterQuery } from "mongoose";
import NotFoundError from "../errors/not-found";
import ProductCollection, { IProduct } from "../models/Product";
import { StatusCodes } from "http-status-codes";

const getAllProducts = async (req: Request, res: Response) => {
  const { category, search, sort, brand, maxPrice } = req.query;
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

  const products = await result;
  res.status(StatusCodes.OK).json({
    success: true,
    count: products.length,
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

export { getAllProducts, singleProduct };
