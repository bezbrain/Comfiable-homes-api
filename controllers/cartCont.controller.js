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

  // Update the counter with the updated counter checking if counter has reached limit
  if (item.counter === 5) {
    const updateCounter = await CartCollection.findOneAndUpdate(
      { _id: itemId, createdBy: userId },
      { ...req.body, counter: 5, isIncreaseBlur: true, isDecreaseBlur: false },
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

  // Update the counter with the updated counter checking if counter hasn't reached limit
  const updateCounter = await CartCollection.findOneAndUpdate(
    { _id: itemId, createdBy: userId },
    {
      ...req.body,
      counter: increaseCounter,
      isIncreaseBlur: false,
      isDecreaseBlur: false,
    },
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

  // Update the counter with the updated counter checking if counter has reached limit
  if (item.counter === 1) {
    const updateCounter = await CartCollection.findOneAndUpdate(
      { _id: itemId, createdBy: userId },
      { ...req.body, counter: 1, isDecreaseBlur: true, isIncreaseBlur: false },
      { new: true, runValidations: true }
    );
    if (!updateCounter) {
      throw new NotFoundError(`Item with the id ${itemId} not found`);
    }
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Counter cannot be less than one",
      updateCounter,
    });
  }

  // Update the counter with the updated counter
  const updateCounter = await CartCollection.findOneAndUpdate(
    { _id: itemId, createdBy: userId },
    {
      ...req.body,
      counter: decreaseCounter,
      isDecreaseBlur: false,
      isIncreaseBlur: false,
    },
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
  cartIncrease,
  cartDecrease,
};
