const { StatusCodes } = require("http-status-codes");

const NotFoundMiddleware = (req, res) => {
  return res
    .status(StatusCodes.NOT_FOUND)
    .send("<h1>This page does not exist</h1><a href='/'>Go back home</a>");
};

module.exports = NotFoundMiddleware;
