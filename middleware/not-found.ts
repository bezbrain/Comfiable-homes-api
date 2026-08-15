import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const NotFoundMiddleware = (_req: Request, res: Response) => {
  return res
    .status(StatusCodes.NOT_FOUND)
    .send("<h1>This page does not exist</h1><a href='/'>Go back home</a>");
};

export default NotFoundMiddleware;
