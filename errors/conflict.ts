import CustomAPIError from "./custom-error";
import { StatusCodes } from "http-status-codes";

class ConflictError extends CustomAPIError {
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.CONFLICT;
  }
}

export default ConflictError;
