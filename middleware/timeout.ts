import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

const timeoutMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.timedout) {
    next();
  } else {
    res.status(StatusCodes.REQUEST_TIMEOUT).json({
      success: false,
      message: "Request timeout. Please check internet and refresh page",
    });
  }
};

export default timeoutMiddleware;
