import { Request, Response } from "express";
import CartCollection from "../models/Cart";
import { StatusCodes } from "http-status-codes";
import NotFoundError from "../errors/not-found";

const cartIncrease = async (req: Request, res: Response) => {
  const {
    params: { itemId },
    user: { userId },
  } = req as Request & { user: { userId: string; username: string } };

  const item = await CartCollection.findOne({ _id: itemId, createdBy: userId });
  if (!item) {
    throw new NotFoundError(`Item with the id ${itemId} not found`);
  }

  const increaseCounter = item.counter + 1;

  if (item.counter === 5) {
    const updateCounter = await CartCollection.findOneAndUpdate(
      { _id: itemId, createdBy: userId },
      { ...req.body, counter: 5, isIncreaseBlur: true, isDecreaseBlur: false },
      { new: true, runValidations: true } as { new: boolean }
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
    {
      ...req.body,
      counter: increaseCounter,
      isIncreaseBlur: false,
      isDecreaseBlur: false,
    },
    { new: true, runValidations: true } as { new: boolean }
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

const cartDecrease = async (req: Request, res: Response) => {
  const {
    params: { itemId },
    user: { userId },
  } = req as Request & { user: { userId: string; username: string } };

  const item = await CartCollection.findOne({ _id: itemId, createdBy: userId });
  if (!item) {
    throw new NotFoundError(`Item with the id ${itemId} not found`);
  }

  const decreaseCounter = item.counter - 1;

  if (item.counter === 1) {
    const updateCounter = await CartCollection.findOneAndUpdate(
      { _id: itemId, createdBy: userId },
      { ...req.body, counter: 1, isDecreaseBlur: true, isIncreaseBlur: false },
      { new: true, runValidations: true } as { new: boolean }
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

  const updateCounter = await CartCollection.findOneAndUpdate(
    { _id: itemId, createdBy: userId },
    {
      ...req.body,
      counter: decreaseCounter,
      isDecreaseBlur: false,
      isIncreaseBlur: false,
    },
    { new: true, runValidations: true } as { new: boolean }
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

export { cartIncrease, cartDecrease };
