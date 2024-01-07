const { revokedTokens } = require("../controllers/auth.controller");
const UnauthenticatedError = require("../errors/unauthenticated");
const ForbiddenError = require("../errors/forbidden");
const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  const {
    headers: { authorization },
  } = req;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new UnauthenticatedError("User unauthenticated");
  }

  const extractToken = authorization.split(" ")[1];

  // Check if token is not revoked yet
  if (revokedTokens.includes(extractToken)) {
    throw new ForbiddenError("Forbidden: Token has been revoked");
  }

  try {
    const payload = jwt.verify(extractToken, process.env.JWT_SECRET);
    const { userId, username } = payload;
    req.user = { userId, username };
    next();
  } catch (error) {
    throw new UnauthenticatedError(
      "Not authorized to access this page, please login"
    );
  }
};

module.exports = authMiddleware;
