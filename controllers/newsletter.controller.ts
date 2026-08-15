import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import NewsletterCollection from "../models/Newsletter";
import BadRequestError from "../errors/bad-request";

const subscribeNewsletter = async (req: Request, res: Response) => {
  const email = String(req.body?.email || "").trim().toLowerCase();

  if (!email) {
    throw new BadRequestError("Email cannot be empty");
  }

  const existing = await NewsletterCollection.findOne({ email });
  if (existing) {
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "You are already subscribed to our newsletter",
    });
  }

  await NewsletterCollection.create({ email });

  res.status(StatusCodes.CREATED).json({
    success: true,
      message: "You are on the list. Your first-order code is on the way.",
  });
};

export { subscribeNewsletter };
