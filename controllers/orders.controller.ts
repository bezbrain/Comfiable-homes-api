import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import OrderCollection from "../models/Order";
import BadRequestError from "../errors/bad-request";
import NotFoundError from "../errors/not-found";

const getOrders = async (req: Request, res: Response) => {
  const {
    user: { userId },
    query: { status },
  } = req as Request & { user: { userId: string; username: string } };

  const orderStatus = String(status || "open");
  if (orderStatus !== "open" && orderStatus !== "closed") {
    throw new BadRequestError("Status must be open or closed");
  }

  const orders = await OrderCollection.find({
    createdBy: userId,
    status: orderStatus,
  }).sort({ createdAt: -1 });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Orders retrieved",
    count: orders.length,
    status: orderStatus,
    orders,
  });
};

const getSingleOrder = async (req: Request, res: Response) => {
  const {
    user: { userId },
    params: { orderId },
  } = req as Request & { user: { userId: string; username: string } };

  const order = await OrderCollection.findOne({
    _id: orderId,
    createdBy: userId,
  });

  if (!order) {
    throw new NotFoundError(`Order with the id ${orderId} was not found`);
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Order retrieved",
    order,
  });
};

export { getOrders, getSingleOrder };
