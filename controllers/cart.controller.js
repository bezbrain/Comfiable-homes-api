const CartCollection = require("../models/Cart");
const ProductCollection = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const NotFoundError = require("../errors/not-found");

// ADD TO CART
const addToCart = async (req, res) => {
  const {
    user: { userId },
    body: { productId },
  } = req;

  req.body.createdBy = userId;

  const checkId = await ProductCollection.findOne({
    _id: productId,
  });
  // // Check if id is available in any product
  if (!checkId) {
    throw new NotFoundError(`Product with the id ${productId} not found`);
  }

  const searchCart = await CartCollection.findOne({
    productId,
    createdBy: userId,
  });
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

// GET ALL ITEMS IN CART
const getCartItems = async (req, res) => {
  const {
    user: { userId },
  } = req;
  const items = await CartCollection.find({ createdBy: userId });

  if (items.length === 0) {
    throw new NotFoundError("No item found in cart");
  }
  res.status(StatusCodes.OK).json({
    success: true,
    message: "All items",
    count: items.length,
    items,
  });
};

// DELETE ITEM IN CART
const deleteFromCart = async (req, res) => {
  const {
    user: { userId },
    params: { itemId },
  } = req;

  const cartParam = await CartCollection.findOne({
    _id: itemId,
  });
  // Check if item exists in the cart collection
  if (!cartParam) {
    throw new NotFoundError(`Item with the id ${itemId} not found`);
  }

  const cart = await CartCollection.findOneAndDelete({
    _id: itemId,
    createdBy: userId,
  });
  // Check if item in the correct id belongs to the logged in user
  if (!cart) {
    throw new NotFoundError(`You don't have the authority to remove this item`);
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Item successfully removed from cart",
  });
};

module.exports = {
  addToCart,
  getCartItems,
  deleteFromCart,
};
