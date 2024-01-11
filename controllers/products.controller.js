const NotFoundError = require("../errors/not-found");
const ProductCollection = require("../models/Product");
const { StatusCodes } = require("http-status-codes");

const getAllProducts = async (req, res) => {
  const { category, search, sort, brand, maxPrice } = req.query;
  // console.log(req.query);
  let queryObject = {};

  // Filter by category
  if (category && category !== "All") {
    queryObject.category = category;
  }

  // Filter by namme/type
  if (search) {
    queryObject.type = { $regex: search, $options: "i" };
  }

  // Filter by company/brand
  if (brand && brand !== "All") {
    queryObject.brand = brand;
  }

  // Filter by price range
  if (maxPrice) {
    // console.log(queryObject);
    queryObject.price = {};
    // console.log(queryObject);
    queryObject.price.$lte = parseFloat(maxPrice);
  }

  let result = ProductCollection.find(queryObject);

  // Sort product
  if (sort) {
    result = result.sort(sort);
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

const singleProduct = async (req, res) => {
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

module.exports = {
  getAllProducts,
  singleProduct,
};
