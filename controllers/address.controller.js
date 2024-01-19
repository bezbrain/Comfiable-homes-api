const AddressCollection = require("../models/Address");
const { StatusCodes } = require("http-status-codes");
const BadRequestError = require("../errors/bad-request");

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
    throw new BadRequestError("Address Already exist. Pleeas update instead");
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

module.exports = {
  createAddress,
  getAddress,
};
