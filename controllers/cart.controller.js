const CartCollection = require("../models/Cart");
const ProductCollection = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const NotFoundError = require("../errors/not-found");
const ConflictError = require("../errors/conflict");

// ADD TO CART
const addToCart = async (req, res) => {
  const {
    user: { userId },
    body: { productId },
  } = req;

  const getPresentProduct = await ProductCollection.findOne({
    _id: productId,
  });
  // Check if id is available in any product
  if (!getPresentProduct) {
    throw new NotFoundError(`Product with the id ${productId} not found`);
  }

  // Modify existing object to contain createdBy and productId property
  const updatedProduct = {
    ...getPresentProduct.toObject(),
    createdBy: userId,
    productId: productId,
  };

  // Remove the _id property so that mongoose with generate a new one itself
  delete updatedProduct._id;

  const searchCart = await CartCollection.findOne({
    productId,
    createdBy: userId,
  });
  // Check if cart is already present in cart
  if (searchCart) {
    throw new ConflictError("Item already in cart");
  }

  const toCart = await CartCollection.create(updatedProduct);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Item added to cart",
    toCart,
  });
};

// GET ALL ITEMS IN CART
const getCartItems = async (req, res) => {
  const {
    user: { userId },
  } = req;
  const items = await CartCollection.find({ createdBy: userId });

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
  // Check if item is the correct id and belongs to the logged in user
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
