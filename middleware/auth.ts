import { Request, Response, NextFunction } from "express";
import { revokedTokens } from "../controllers/auth.controller";
import UnauthenticatedError from "../errors/unauthenticated";
import ForbiddenError from "../errors/forbidden";
import jwt from "jsonwebtoken";

interface AuthTokenPayload {
  userId: string;
  username: string;
  isAdmin?: boolean;
}

const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const {
    headers: { authorization },
  } = req;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new UnauthenticatedError("User unauthenticated");
  }

  const extractToken = authorization.split(" ")[1];

  if (revokedTokens.includes(extractToken)) {
    throw new ForbiddenError("Forbidden: Token has been revoked");
  }

  try {
    const payload = jwt.verify(
      extractToken,
      process.env.JWT_SECRET as string
    ) as AuthTokenPayload;
    const { userId, username, isAdmin } = payload;
    req.user = { userId, username, isAdmin };
    next();
  } catch (error) {
    throw new UnauthenticatedError(
      "Not authorized to access this page, please login"
    );
  }
};

export default authMiddleware;
