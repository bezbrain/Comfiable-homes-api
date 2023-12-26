const UserCollection = require("../models/Users");
const { StatusCodes } = require("http-status-codes");
const BadRequestError = require("../errors/bad-request");
const UnauthenticatedError = require("../errors/unauthenticated");

const register = async (req, res) => {
  const user = await UserCollection.create(req.body);
  const token = user.createJWT();

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "User registration successful",
    token,
  });
};

const login = async (req, res) => {
  const {
    body: { email, password },
  } = req;

  if (!email || !password) {
    throw new BadRequestError("Email or Password cannot be empty");
  }

  const user = await UserCollection.findOne({ email });

  if (!user) {
    throw new BadRequestError("Email does not exist");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Password does not match");
  }

  const token = user.createJWT();

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "User login successful",
    token,
  });
};

module.exports = { register, login };
