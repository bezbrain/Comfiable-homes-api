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

module.exports = {
  getAllProducts,
};
