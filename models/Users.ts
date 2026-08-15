import mongoose, { Schema, Model, HydratedDocument } from "mongoose";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";

export interface IUser {
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
  isVerified: boolean;
  emailVerificationOtp?: string;
  emailVerificationOtpExpires?: Date;
  emailVerificationAttempts: number;
  passwordResetOtp?: string;
  passwordResetOtpExpires?: Date;
  passwordResetAttempts: number;
}

export interface IUserMethods {
  createJWT(): string;
  comparePassword(userPassword: string): Promise<boolean>;
}

export type UserDocument = HydratedDocument<IUser, IUserMethods>;
type UserModel = Model<IUser, Record<string, never>, IUserMethods>;

const UserSchema = new Schema<IUser, UserModel, IUserMethods>({
  username: {
    type: String,
    required: [true, "Please provide username"],
    trim: true,
    minlength: [3, "Username characters should be less than 3"],
    maxlength: [10, "Username characters should not be more than 10"],
    unique: true,
  },

  email: {
    type: String,
    required: [true, "Please provide email"],
    trim: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email",
    ],
    unique: true,
  },

  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: [6, "Password character cannot be less than 6"],
  },

  isAdmin: {
    type: Boolean,
    default: false,
  },

  isVerified: {
    type: Boolean,
    default: true,
  },

  emailVerificationOtp: String,
  emailVerificationOtpExpires: Date,
  emailVerificationAttempts: {
    type: Number,
    default: 0,
  },
  passwordResetOtp: String,
  passwordResetOtpExpires: Date,
  passwordResetAttempts: {
    type: Number,
    default: 0,
  },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this._id, username: this.username, isAdmin: this.isAdmin },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_LIFETIME as SignOptions["expiresIn"] }
  );
};

UserSchema.methods.comparePassword = async function (userPassword: string) {
  const isMatch = await bcrypt.compare(userPassword, this.password);
  return isMatch;
};

export default mongoose.model<IUser, UserModel>("Users", UserSchema);
