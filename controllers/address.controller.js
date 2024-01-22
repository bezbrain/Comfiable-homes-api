const AddressCollection = require("../models/Address");
const { StatusCodes } = require("http-status-codes");
const BadRequestError = require("../errors/bad-request");
const NotFoundError = require("../errors/not-found");

// CREATE AN ADDRESS
const createAddress = async (req, res) => {
  const {
    body,
    user: { userId },
  } = req;
  body.createdBy = userId;

  //   Check if address already existed
  const findAddress = await AddressCollection.findOne({ createdBy: userId });
  if (findAddress) {
    throw new BadRequestError("Address Already exist. Please update instead");
  }

  const address = await AddressCollection.create(body);
  res.status(StatusCodes.CREATED).json({
    success: true,
    address,
    message: "Address created",
  });
};

// GET AN ADDRESS
const getAddress = async (req, res) => {
  const {
    user: { userId },
  } = req;

  const address = await AddressCollection.findOne({ createdBy: userId });
  //   Check if address for a user is available
  if (!address) {
    throw new BadRequestError("Address Information cannot be found");
  }

  res.status(StatusCodes.OK).json({
    success: true,
    address,
    message: "Successfully fetched",
  });
};

const updateAddress = async (req, res) => {
  const {
    body,
    user: { userId },
  } = req;

  const { firstName, lastName, address, city, zipCode, mobileNumber, email } =
    body;

  // Check if all fields are filled
  if (
    !firstName ||
    !lastName ||
    !address ||
    !city ||
    !zipCode ||
    !mobileNumber ||
    !email
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

  //   Check if address with the right user Id exist
  if (!findAddress) {
    throw new NotFoundError("User with an address not found");
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Updated successfully",
  });
};

module.exports = {
  createAddress,
  getAddress,
  updateAddress,
};
