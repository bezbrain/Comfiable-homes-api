import { Request, Response } from "express";
import UserCollection from "../models/Users";
import { StatusCodes } from "http-status-codes";
import BadRequestError from "../errors/bad-request";
import UnauthenticatedError from "../errors/unauthenticated";

export let revokedTokens: string[] = [];

const register = async (req: Request, res: Response) => {
  const user = await UserCollection.create(req.body);
  const token = user.createJWT();

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "User registration successful",
    token,
  });
};

const login = async (req: Request, res: Response) => {
  const {
    body: { email, password },
  } = req;

  if (!email || !password) {
    throw new BadRequestError("Email or Password cannot be empty");
  }

  const user = await UserCollection.findOne({ email });

  if (!user) {
    throw new BadRequestError("Email does not exist");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Password does not match");
  }

  const token = user.createJWT();

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "User login successful",
    token,
    user: user.username,
  });
};

const logout = async (req: Request, res: Response) => {
  const {
    headers: { authorization },
  } = req;

  if (!authorization) {
    throw new BadRequestError("Logout was not successful");
  }

  const extractToken = authorization.split(" ")[1];

  revokedTokens.push(extractToken);
  revokedTokens = [];

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Logout successful",
  });
};

export { register, login, logout };
