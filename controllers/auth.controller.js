const UserCollection = require("../models/Users");
const { StatusCodes } = require("http-status-codes");

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
  res.send("Login");
};

module.exports = { register, login };
