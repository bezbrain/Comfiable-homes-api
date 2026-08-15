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
  mobileNumber?: number | string;
  email?: string;
  state?: string;
  country?: string;
  createdBy?: string;
  isPrimary?: boolean;
  isAddress?: boolean;
}

const requiredFields = (body: AddressBody) => {
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
};

const withUser = (req: Request) =>
  req as Request<
    { id?: string },
    unknown,
    AddressBody
  > & { user: { userId: string; username: string } };

const normalizeAddress = (address: {
  isPrimary?: boolean;
  isAddress?: boolean;
}) => ({
  ...address,
  isPrimary: Boolean(address.isPrimary || address.isAddress),
});

const listUserAddresses = async (userId: string) => {
  const addresses = await AddressCollection.find({ createdBy: userId }).sort({
    isPrimary: -1,
    isAddress: -1,
    createdAt: -1,
  });
  return addresses.map((item) => normalizeAddress(item.toObject()));
};

const clearPrimary = async (userId: string) => {
  await AddressCollection.updateMany(
    { createdBy: userId },
    { isPrimary: false, isAddress: false }
  );
};

const createAddress = async (req: Request, res: Response) => {
  const { body, user } = withUser(req);
  requiredFields(body);

  const existingCount = await AddressCollection.countDocuments({
    createdBy: user.userId,
  });
  const makePrimary = existingCount === 0 || Boolean(body.isPrimary);

  if (makePrimary) {
    await clearPrimary(user.userId);
  }

  const address = await AddressCollection.create({
    ...body,
    createdBy: user.userId,
    isPrimary: makePrimary,
    isAddress: makePrimary,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    address: normalizeAddress(address.toObject()),
    addresses: await listUserAddresses(user.userId),
    message: "Address saved",
  });
};

const getAddress = async (req: Request, res: Response) => {
  const { user } = withUser(req);
  const addresses = await listUserAddresses(user.userId);
  const primary = addresses.find((item) => item.isPrimary) || addresses[0];

  res.status(StatusCodes.OK).json({
    success: addresses.length > 0,
    address: primary || null,
    addresses,
    count: addresses.length,
    message:
      addresses.length > 0
        ? "Successfully fetched"
        : "Address Information cannot be found",
  });
};

const updateAddress = async (req: Request, res: Response) => {
  const { body, user, params } = withUser(req);
  requiredFields(body);

  const addressId = params.id;
  const query = addressId
    ? { _id: addressId, createdBy: user.userId }
    : { createdBy: user.userId, $or: [{ isPrimary: true }, { isAddress: true }] };

  const findAddress = await AddressCollection.findOneAndUpdate(
    query,
    {
      firstName: body.firstName,
      lastName: body.lastName,
      address: body.address,
      city: body.city,
      zipCode: body.zipCode,
      mobileNumber: body.mobileNumber,
      email: body.email,
      state: body.state,
      country: body.country,
    },
    { new: true, runValidators: true }
  );

  if (!findAddress) {
    throw new NotFoundError("Address not found");
  }

  res.status(StatusCodes.OK).json({
    success: true,
    address: normalizeAddress(findAddress.toObject()),
    addresses: await listUserAddresses(user.userId),
    message: "Updated successfully",
  });
};

const setPrimaryAddress = async (req: Request, res: Response) => {
  const { user, params } = withUser(req);
  const address = await AddressCollection.findOne({
    _id: params.id,
    createdBy: user.userId,
  });

  if (!address) {
    throw new NotFoundError("Address not found");
  }

  await clearPrimary(user.userId);
  address.isPrimary = true;
  address.isAddress = true;
  await address.save();

  res.status(StatusCodes.OK).json({
    success: true,
    address: normalizeAddress(address.toObject()),
    addresses: await listUserAddresses(user.userId),
    message: "Primary address updated",
  });
};

const deleteAddress = async (req: Request, res: Response) => {
  const { user, params } = withUser(req);
  const address = await AddressCollection.findOneAndDelete({
    _id: params.id,
    createdBy: user.userId,
  });

  if (!address) {
    throw new NotFoundError("Address not found");
  }

  if (address.isPrimary || address.isAddress) {
    const nextPrimary = await AddressCollection.findOne({
      createdBy: user.userId,
    }).sort({ createdAt: -1 });
    if (nextPrimary) {
      nextPrimary.isPrimary = true;
      nextPrimary.isAddress = true;
      await nextPrimary.save();
    }
  }

  res.status(StatusCodes.OK).json({
    success: true,
    addresses: await listUserAddresses(user.userId),
    message: "Address removed",
  });
};

export {
  createAddress,
  getAddress,
  updateAddress,
  setPrimaryAddress,
  deleteAddress,
};
