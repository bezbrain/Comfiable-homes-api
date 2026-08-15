import { Request, Response } from "express";
import CartCollection from "../models/Cart";
import ProductCollection from "../models/Product";
import { StatusCodes } from "http-status-codes";
import NotFoundError from "../errors/not-found";
import ConflictError from "../errors/conflict";
import UnauthenticatedError from "../errors/unauthenticated";

const addToCart = async (req: Request, res: Response) => {
  const {
    user: { userId },
    body: { productId },
  } = req as Request & { user: { userId: string; username: string } };

  const getPresentProduct = await ProductCollection.findOne({
    _id: productId,
  });
  if (!getPresentProduct) {
    throw new NotFoundError(`Product with the id ${productId} not found`);
  }

  const { _id, ...productFields } = getPresentProduct.toObject();
  const updatedProduct = {
    ...productFields,
    createdBy: userId,
    productId: productId,
  };

  const searchCart = await CartCollection.findOne({
    productId,
    createdBy: userId,
  });
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

const getCartItems = async (req: Request, res: Response) => {
  const {
    user: { userId },
  } = req as Request & { user: { userId: string; username: string } };
  const items = await CartCollection.find({ createdBy: userId });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "All items",
    count: items.length,
    items,
  });
};

const deleteFromCart = async (req: Request, res: Response) => {
  const {
    user: { userId },
    params: { itemId },
  } = req as Request & { user: { userId: string; username: string } };

  const cartParam = await CartCollection.findOne({
    _id: itemId,
  });
  if (!cartParam) {
    throw new NotFoundError(`Item with the id ${itemId} not found`);
  }

  const cart = await CartCollection.findOneAndDelete({
    _id: itemId,
    createdBy: userId,
  });
  if (!cart) {
    throw new NotFoundError(`You don't have the authority to remove this item`);
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Item successfully removed from cart",
  });
};

const deleteAll = async (req: Request, res: Response) => {
  const {
    user: { userId },
  } = req as Request & { user: { userId: string; username: string } };

  if (!userId) {
    throw new UnauthenticatedError(
      "Not authorized to access this page, please login"
    );
  }
  await CartCollection.deleteMany({
    createdBy: userId,
  });
  res.status(StatusCodes.OK).json({
    success: true,
    message: "All items removed from cart",
  });
};

export { addToCart, getCartItems, deleteFromCart, deleteAll };
