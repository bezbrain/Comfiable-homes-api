const CartCollection = require("../models/Cart");
const { StatusCodes } = require("http-status-codes");
const NotFoundError = require("../errors/not-found");
const ConflictError = require("../errors/conflict");
const UnauthenticatedError = require("../errors/unauthenticated");
const BadRequestError = require("../errors/bad-request");

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
