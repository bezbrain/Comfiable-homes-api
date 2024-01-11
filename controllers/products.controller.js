const NotFoundError = require("../errors/not-found");
const ProductCollection = require("../models/Product");
const { StatusCodes } = require("http-status-codes");

const getAllProducts = async (req, res) => {
  const { category, search, sort, brand } = req.query;
  // console.log(req.query);
  let queryObject = {};

  // Sort by company/brand
  if (brand) {
    queryObject.brand = brand;
  }
  if (brand === "All") {
    queryObject = {};
  }

  // Sort by category
  if (category) {
    queryObject.category = category;
  }
  if (category === "All") {
    queryObject = {};
  }

  // Name search
  if (search) {
    queryObject.type = { $regex: search, $options: "i" };
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
