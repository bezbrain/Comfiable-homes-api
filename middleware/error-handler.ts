import { ErrorRequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

interface AppError extends Error {
  statusCode?: number;
  code?: number;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { message: string }>;
  stringValue?: string;
}

const ErrorHandlerMiddleware: ErrorRequestHandler = (
  err: AppError,
  _req,
  res,
  _next
) => {
  const customError = {
    message: err.message || "Something went wrong, please try again later",
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
  };

  if (err.name === "ValidationError" && err.errors) {
    const errorValue = Object.values(err.errors)
      .map((each) => each.message)
      .join(", ");
    customError.message = errorValue;
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  if (err.code === 11000 && err.keyValue) {
    const errorValue = Object.keys(err.keyValue)[0];
    customError.message = `${errorValue} needs to be unique. Please try another value`;
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  if (err.name === "CastError") {
    customError.message = `Product with the id ${err.stringValue} not found`;
    customError.statusCode = StatusCodes.NOT_FOUND;
  }

  res.status(customError.statusCode).json({
    success: false,
    message: customError.message,
  });
};

export default ErrorHandlerMiddleware;
