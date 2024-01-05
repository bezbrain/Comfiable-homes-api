const addToCart = async (req, res) => {
  console.log(req.user);
  res.send("Add to cart");
};

module.exports = {
  addToCart,
};
