const NotFoundError = require("../errors/not-found");
const ProductCollection = require("../models/Product");
const { StatusCodes } = require("http-status-codes");

const getAllProducts = async (req, res) => {
  const products = await ProductCollection.find({});
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
