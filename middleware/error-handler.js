const { StatusCodes } = require("http-status-codes");

const ErrorHandlerMiddleware = async (err, req, res, next) => {
  const customError = {
    message: err.message || "Something went wrong, please try again later",
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
  };

  return res.status(customError.statusCode).json({
    success: false,
    message: customError.message,
  });
};

module.exports = ErrorHandlerMiddleware;
