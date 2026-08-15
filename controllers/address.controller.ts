import { Request, Response } from "express";
import AddressCollection from "../models/Address";
import { StatusCodes } from "http-status-codes";
import BadRequestError from "../errors/bad-request";
import NotFoundError from "../errors/not-found";

interface AddressBody {
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  mobileNumber?: number;
  email?: string;
  state?: string;
  country?: string;
  createdBy?: string;
  isAddress?: boolean;
}

const createAddress = async (req: Request, res: Response) => {
  const {
    body,
    user: { userId },
  } = req as Request<
    Record<string, never>,
    unknown,
    AddressBody
  > & { user: { userId: string; username: string } };
  body.createdBy = userId;

  const findAddress = await AddressCollection.findOne({ createdBy: userId });
  if (findAddress) {
    throw new BadRequestError("Address Already exist. Please update instead");
  }

  const address = await AddressCollection.create({
    ...body,
    isAddress: true,
  });
  res.status(StatusCodes.CREATED).json({
    success: true,
    address,
    message: "Address created",
  });
};

const getAddress = async (req: Request, res: Response) => {
  const {
    user: { userId },
  } = req as Request & { user: { userId: string; username: string } };

  const address = await AddressCollection.findOne({ createdBy: userId });
  if (!address) {
    return res.status(StatusCodes.OK).json({
      success: false,
      message: "Address Information cannot be found",
    });
  }

  res.status(StatusCodes.OK).json({
    success: true,
    address,
    message: "Successfully fetched",
  });
};

const updateAddress = async (req: Request, res: Response) => {
  const {
    body,
    user: { userId },
  } = req as Request<
    Record<string, never>,
    unknown,
    AddressBody
  > & { user: { userId: string; username: string } };

  const {
    firstName,
    lastName,
    address,
    city,
    zipCode,
    mobileNumber,
    email,
    state,
    country,
  } = body;

  if (
    !firstName ||
    !lastName ||
    !address ||
    !city ||
    !zipCode ||
    !mobileNumber ||
    !email ||
    !state ||
    !country
  ) {
    throw new BadRequestError("No field should be left empty");
  }

  const findAddress = await AddressCollection.findOneAndUpdate(
    {
      createdBy: userId,
    },
    req.body,
    { new: true, runValidators: true }
  );

  if (!findAddress) {
    throw new NotFoundError("User with an address not found");
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Updated successfully",
  });
};

export { createAddress, getAddress, updateAddress };
