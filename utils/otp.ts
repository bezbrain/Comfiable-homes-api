import crypto from "crypto";
import bcrypt from "bcryptjs";

export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;

export const createOtp = () =>
  String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");

export const hashOtp = async (otp: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
};

export const compareOtp = (otp: string, hashed?: string | null) => {
  if (!hashed) {
    return Promise.resolve(false);
  }
  return bcrypt.compare(otp, hashed);
};

export const isOtpExpired = (expiresAt?: Date | null) =>
  !expiresAt || expiresAt.getTime() < Date.now();

export const isOtpOnCooldown = (expiresAt?: Date | null) => {
  if (!expiresAt) {
    return false;
  }
  return expiresAt.getTime() - Date.now() > OTP_TTL_MS - OTP_RESEND_COOLDOWN_MS;
};
