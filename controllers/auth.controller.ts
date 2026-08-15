import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import UserCollection from "../models/Users";
import config from "../config/config";
import BadRequestError from "../errors/bad-request";
import UnauthenticatedError from "../errors/unauthenticated";
import {
  sendPasswordChangedEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../utils/mailer";
import {
  OTP_MAX_ATTEMPTS,
  OTP_TTL_MS,
  compareOtp,
  createOtp,
  hashOtp,
  isOtpExpired,
  isOtpOnCooldown,
} from "../utils/otp";

export let revokedTokens: string[] = [];

const normalizeEmail = (email: string) => String(email || "").trim().toLowerCase();

const verificationUrl = (email: string) =>
  `${config.frontendUrl}/verify-email?email=${encodeURIComponent(email)}`;

const resetUrl = (email: string) =>
  `${config.frontendUrl}/reset-password?email=${encodeURIComponent(email)}`;

const issueVerificationOtp = async (user: {
  email: string;
  emailVerificationOtp?: string;
  emailVerificationOtpExpires?: Date;
  emailVerificationAttempts: number;
  save: () => Promise<unknown>;
}) => {
  if (isOtpOnCooldown(user.emailVerificationOtpExpires)) {
    throw new BadRequestError("Please wait a minute before requesting another code");
  }

  const otp = createOtp();
  user.emailVerificationOtp = await hashOtp(otp);
  user.emailVerificationOtpExpires = new Date(Date.now() + OTP_TTL_MS);
  user.emailVerificationAttempts = 0;
  await user.save();
  void sendVerificationEmail(user.email, otp, verificationUrl(user.email)).catch(
    (error) => console.error("Could not send verification email", error)
  );
};

const issuePasswordResetOtp = async (user: {
  email: string;
  passwordResetOtp?: string;
  passwordResetOtpExpires?: Date;
  passwordResetAttempts: number;
  save: () => Promise<unknown>;
}) => {
  if (isOtpOnCooldown(user.passwordResetOtpExpires)) {
    throw new BadRequestError("Please wait a minute before requesting another code");
  }

  const otp = createOtp();
  user.passwordResetOtp = await hashOtp(otp);
  user.passwordResetOtpExpires = new Date(Date.now() + OTP_TTL_MS);
  user.passwordResetAttempts = 0;
  await user.save();
  void sendPasswordResetEmail(user.email, otp, resetUrl(user.email)).catch(
    (error) => console.error("Could not send password reset email", error)
  );
};

const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  const user = await UserCollection.create({
    username,
    email: normalizedEmail,
    password,
    isVerified: false,
  });

  try {
    await issueVerificationOtp(user);
  } catch (error) {
    console.error("Could not issue verification code", error);
  }

  if (res.headersSent) {
    return;
  }

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Account created. Enter the code we sent to your email.",
    requiresVerification: true,
    email: user.email,
  });
};

const login = async (req: Request, res: Response) => {
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;

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

  if (user.isVerified === false) {
    try {
      await issueVerificationOtp(user);
    } catch (error) {
      if (!(error instanceof BadRequestError)) {
        console.error("Could not resend verification email", error);
      }
    }

    if (res.headersSent) {
      return;
    }

    return res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      message: "Please verify your email with the code we sent you.",
      needsVerification: true,
      email: user.email,
    });
  }

  const token = user.createJWT();

  res.status(StatusCodes.OK).json({
    success: true,
    message: "User login successful",
    token,
    user: user.username,
    isAdmin: user.isAdmin,
  });
};

const verifyEmail = async (req: Request, res: Response) => {
  const email = normalizeEmail(req.body.email);
  const otp = String(req.body.otp || "").trim();

  if (!email || !otp) {
    throw new BadRequestError("Email and code cannot be empty");
  }

  const user = await UserCollection.findOne({ email });
  if (!user) {
    throw new BadRequestError("Email does not exist");
  }

  if (user.isVerified) {
    const token = user.createJWT();
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Email is already verified",
      token,
      user: user.username,
      isAdmin: user.isAdmin,
    });
  }

  if (user.emailVerificationAttempts >= OTP_MAX_ATTEMPTS) {
    throw new BadRequestError("Too many attempts. Request a new code.");
  }

  if (isOtpExpired(user.emailVerificationOtpExpires)) {
    throw new BadRequestError("This code has expired. Request a new one.");
  }

  const isMatch = await compareOtp(otp, user.emailVerificationOtp);
  if (!isMatch) {
    user.emailVerificationAttempts += 1;
    await user.save();
    throw new UnauthenticatedError("The code you entered is not correct");
  }

  user.isVerified = true;
  user.emailVerificationOtp = undefined;
  user.emailVerificationOtpExpires = undefined;
  user.emailVerificationAttempts = 0;
  await user.save();

  const token = user.createJWT();

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Email verified. You are now signed in.",
    token,
    user: user.username,
    isAdmin: user.isAdmin,
  });
};

const resendVerification = async (req: Request, res: Response) => {
  const email = normalizeEmail(req.body.email);
  if (!email) {
    throw new BadRequestError("Email cannot be empty");
  }

  const user = await UserCollection.findOne({ email });
  if (!user) {
    throw new BadRequestError("Email does not exist");
  }

  if (user.isVerified) {
    throw new BadRequestError("This email is already verified");
  }

  await issueVerificationOtp(user);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "A new code has been sent to your email.",
    email: user.email,
  });
};

const forgotPassword = async (req: Request, res: Response) => {
  const email = normalizeEmail(req.body.email);
  if (!email) {
    throw new BadRequestError("Email cannot be empty");
  }

  const user = await UserCollection.findOne({ email });
  if (user) {
    try {
      await issuePasswordResetOtp(user);
    } catch (error) {
      console.error("Could not send password reset email", error);
    }
  }

  if (res.headersSent) {
    return;
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: "If that email is registered, we sent a reset code.",
    email,
  });
};

const resetPassword = async (req: Request, res: Response) => {
  const email = normalizeEmail(req.body.email);
  const otp = String(req.body.otp || "").trim();
  const { password } = req.body;

  if (!email || !otp || !password) {
    throw new BadRequestError("Email, code, and new password cannot be empty");
  }

  if (String(password).length < 6) {
    throw new BadRequestError("Password character cannot be less than 6");
  }

  const user = await UserCollection.findOne({ email });
  if (!user) {
    throw new BadRequestError("Email does not exist");
  }

  if (user.passwordResetAttempts >= OTP_MAX_ATTEMPTS) {
    throw new BadRequestError("Too many attempts. Request a new code.");
  }

  if (isOtpExpired(user.passwordResetOtpExpires)) {
    throw new BadRequestError("This code has expired. Request a new one.");
  }

  const isMatch = await compareOtp(otp, user.passwordResetOtp);
  if (!isMatch) {
    user.passwordResetAttempts += 1;
    await user.save();
    throw new UnauthenticatedError("The code you entered is not correct");
  }

  user.password = password;
  user.passwordResetOtp = undefined;
  user.passwordResetOtpExpires = undefined;
  user.passwordResetAttempts = 0;
  await user.save();

  void sendPasswordChangedEmail(user.email).catch((error) =>
    console.error("Could not send password-changed email", error)
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Password updated. You can sign in now.",
    email: user.email,
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

const getMe = async (req: Request, res: Response) => {
  const user = await UserCollection.findById(req.user?.userId).select(
    "username isAdmin isVerified"
  );

  if (!user) {
    throw new UnauthenticatedError("User not found");
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: "User retrieved",
    user: user.username,
    isAdmin: Boolean(user.isAdmin),
    isVerified: user.isVerified !== false,
  });
};

export {
  register,
  login,
  logout,
  getMe,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
};
