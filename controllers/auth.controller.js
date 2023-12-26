const register = async (req, res) => {
  res.send("Registration");
};

const login = async (req, res) => {
  res.send("Login");
};

module.exports = { register, login };
