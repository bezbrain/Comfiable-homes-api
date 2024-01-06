const CartCollection = require("../models/Cart");
const { StatusCodes } = require("http-status-codes");

const addToCart = async (req, res) => {
  const {
    user: { userId },
    body: { productId },
  } = req;

  req.body.createdBy = userId;

  const searchCart = await CartCollection.findOne({ productId });
  // Check if cart is already present in cart
  if (searchCart) {
    return res.status(StatusCodes.CONFLICT).json({
      success: true,
      message: "Item already in cart",
    });
  }

  const addToCart = await CartCollection.create(req.body);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Item added to cart",
    addToCart,
  });
};

module.exports = {
  addToCart,
};
