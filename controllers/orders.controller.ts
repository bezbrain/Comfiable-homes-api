import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import OrderCollection from "../models/Order";
import UserCollection from "../models/Users";
import BadRequestError from "../errors/bad-request";
import ForbiddenError from "../errors/forbidden";
import NotFoundError from "../errors/not-found";
import { sendOrderCompletedEmail } from "../utils/mailer";

type AuthUser = { userId: string; username: string; isAdmin?: boolean };

const getCurrentUser = async (userId: string) => {
  const user = await UserCollection.findById(userId).select("isAdmin");
  return Boolean(user?.isAdmin);
};

const getOrders = async (req: Request, res: Response) => {
  const {
    user: { userId },
    query: { status },
  } = req as Request & { user: AuthUser };

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

const getAdminOrders = async (req: Request, res: Response) => {
  const {
    user: { userId },
    query: { status },
  } = req as Request & { user: AuthUser };

  const isAdmin = await getCurrentUser(userId);
  if (!isAdmin) {
    throw new ForbiddenError("Only admins can view all orders");
  }

  const orderStatus = String(status || "open");
  if (orderStatus !== "open" && orderStatus !== "closed") {
    throw new BadRequestError("Status must be open or closed");
  }

  const orders = await OrderCollection.find({ status: orderStatus }).sort({
    createdAt: -1,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Orders retrieved",
    count: orders.length,
    status: orderStatus,
    isAdmin: true,
    orders,
  });
};

const getSingleOrder = async (req: Request, res: Response) => {
  const {
    user: { userId },
    params: { orderId },
  } = req as Request & { user: AuthUser };

  const isAdmin = await getCurrentUser(userId);
  const order = await OrderCollection.findOne(
    isAdmin ? { _id: orderId } : { _id: orderId, createdBy: userId }
  );

  if (!order) {
    throw new NotFoundError(`Order with the id ${orderId} was not found`);
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Order retrieved",
    order,
  });
};

const completeOrder = async (req: Request, res: Response) => {
  const {
    user: { userId },
    params: { orderId },
  } = req as Request & { user: AuthUser };

  const isAdmin = await getCurrentUser(userId);
  if (!isAdmin) {
    throw new ForbiddenError("Only admins can mark an order as completed");
  }

  const order = await OrderCollection.findById(orderId);
  if (!order) {
    throw new NotFoundError(`Order with the id ${orderId} was not found`);
  }

  if (order.status === "closed") {
    throw new BadRequestError("This order is already completed");
  }

  order.status = "closed";
  order.completedAt = new Date();
  await order.save();

  if (order.email) {
    void sendOrderCompletedEmail(order.email, {
      total: order.total,
      reference: order.reference,
    }).catch((error) =>
      console.error("Could not send order-completed email", error)
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Order marked as completed",
    order,
  });
};

export { getOrders, getAdminOrders, getSingleOrder, completeOrder };
