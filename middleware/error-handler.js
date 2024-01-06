const { StatusCodes } = require("http-status-codes");

const ErrorHandlerMiddleware = async (err, req, res, next) => {
  const customError = {
    message: err.message || "Something went wrong, please try again later",
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
  };

  // Handle validation error
  if (err.name === "ValidationError") {
    const errorValue = Object.values(err.errors)
      .map((each) => each.message)
      .join(", ");
    // console.log(errorValue);
    customError.message = errorValue;
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  // Handle Uniqueness error, that is, when a value has already existed in the db
  if (err.code === 11000) {
    const errorValue = Object.keys(err.keyValue)[0];
    // console.log(errorValue);
    customError.message = `${errorValue} needs to the unique. Please try another value`;
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  // Handle Cast error, that is, when an id is not in the right format
  if (err.name === "CastError") {
    customError.message = `Product with the id ${err.stringValue} not found`;
    customError.statusCode = StatusCodes.NOT_FOUND;
  }

  res.status(customError.statusCode).json({
    success: false,
    message: customError.message,
  });
  // res.status(customError.statusCode).json({
  //   success: false,
  //   message: err,
  // });
};

module.exports = ErrorHandlerMiddleware;
