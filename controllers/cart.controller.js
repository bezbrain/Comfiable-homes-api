const CartCollection = require("../models/Cart");
const ProductCollection = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const NotFoundError = require("../errors/not-found");
const ConflictError = require("../errors/conflict");
const UnauthenticatedError = require("../errors/unauthenticated");
const BadRequestError = require("../errors/bad-request");

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

// DELETE ALL ITEMS IN CART
const deleteAll = async (req, res) => {
  const {
    user: { userId },
  } = req;

  if (!userId) {
    throw new UnauthenticatedError(
      "Not authorized to access this page, please login"
    );
  }
  const allCarts = await CartCollection.deleteMany({
    createdBy: userId,
  });
  res.status(StatusCodes.OK).json({
    success: true,
    message: "All items removed from cart",
  });
};

// INCREASE CART ITEM
const cartIncrease = async (req, res) => {
  const {
    params: { itemId },
    user: { userId },
  } = req;

  // Fetch one item so as to increase its counter
  const item = await CartCollection.findOne({ _id: itemId, createdBy: userId });
  if (!item) {
    throw new NotFoundError(`Item with the id ${itemId} not found`);
  }

  const increaseCounter = item.counter + 1;

  // Update the counter with the updated counter
  if (item.counter === 5) {
    const updateCounter = await CartCollection.findOneAndUpdate(
      { _id: itemId, createdBy: userId },
      { ...req.body, counter: 5, isBlur: true },
      { new: true, runValidations: true }
    );
    if (!updateCounter) {
      throw new NotFoundError(`Item with the id ${itemId} not found`);
    }
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Counter reached limit",
      updateCounter,
    });
  }

  const updateCounter = await CartCollection.findOneAndUpdate(
    { _id: itemId, createdBy: userId },
    { ...req.body, counter: increaseCounter },
    { new: true, runValidations: true }
  );

  if (!updateCounter) {
    throw new NotFoundError(`Item with the id ${itemId} not found`);
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Counter increased",
    updateCounter,
  });
};

// DECREASE CART ITEM
const cartDecrease = async (req, res) => {
  const {
    params: { itemId },
    user: { userId },
  } = req;

  // Fetch one item so as to decrease its counter
  const item = await CartCollection.findOne({ _id: itemId, createdBy: userId });
  if (!item) {
    throw new NotFoundError(`Item with the id ${itemId} not found`);
  }

  const decreaseCounter = item.counter - 1;

  // Update the counter with the updated counter
  const updateCounter = await CartCollection.findOneAndUpdate(
    { _id: itemId, createdBy: userId },
    { ...req.body, counter: decreaseCounter },
    { new: true, runValidations: true }
  );

  if (!updateCounter) {
    throw new NotFoundError(`Item with the id ${itemId} not found`);
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Counter decrease",
    updateCounter,
  });
};

module.exports = {
  addToCart,
  getCartItems,
  deleteFromCart,
  deleteAll,
  cartIncrease,
  cartDecrease,
};
