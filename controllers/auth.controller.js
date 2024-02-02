const UserCollection = require("../models/Users");
const { StatusCodes } = require("http-status-codes");
const BadRequestError = require("../errors/bad-request");
const UnauthenticatedError = require("../errors/unauthenticated");

let revokedTokens = [];

// REGISTER USER
const register = async (req, res) => {
  const user = await UserCollection.create(req.body);
  const token = user.createJWT();

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "User registration successful",
    token,
  });
};

// LOGIN USER
const login = async (req, res) => {
  const {
    body: { email, password },
  } = req;

  console.log(req.user);

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

// LOGOUT USER
const logout = async (req, res) => {
  const {
    headers: { authorization },
  } = req;

  if (!authorization) {
    throw new BadRequestError("Logout was not successful");
  }

  const extractToken = authorization.split(" ")[1];

  revokedTokens.push(extractToken);
  revokedTokens = []; // This is to make sure the previous token remove before adding new token to the array

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Logout successful",
  });
};

module.exports = { register, login, logout, revokedTokens };
