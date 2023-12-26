const UserCollection = require("../models/Users");

const register = async (req, res) => {
  const user = await UserCollection.create(req.body);
  res.send("Registration");
};

const login = async (req, res) => {
  res.send("Login");
};

module.exports = { register, login };
