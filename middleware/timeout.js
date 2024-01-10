const { StatusCodes } = require("http-status-codes");

const timeoutMiddleware = async (req, res, next) => {
  if (!req.timeout) {
    next();
  } else {
    res.status(StatusCodes.REQUEST_TIMEOUT).json({
      success: false,
      message: "Request timeout. Please check internet and refresh page",
    });
  }
};

module.exports = timeoutMiddleware;
