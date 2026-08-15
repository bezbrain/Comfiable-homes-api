import { Request, Response, NextFunction } from "express";
import { revokedTokens } from "../controllers/auth.controller";
import UnauthenticatedError from "../errors/unauthenticated";
import ForbiddenError from "../errors/forbidden";
import jwt from "jsonwebtoken";
import UserCollection from "../models/Users";

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

  let payload: AuthTokenPayload;
  try {
    payload = jwt.verify(
      extractToken,
      process.env.JWT_SECRET as string
    ) as AuthTokenPayload;
  } catch {
    throw new UnauthenticatedError(
      "Not authorized to access this page, please login"
    );
  }

  const user = await UserCollection.findById(payload.userId).select(
    "username isAdmin"
  );

  if (!user) {
    throw new UnauthenticatedError(
      "This account no longer exists. Please sign in again."
    );
  }

  req.user = {
    userId: user._id.toString(),
    username: user.username,
    isAdmin: user.isAdmin,
  };
  next();
};

export default authMiddleware;
