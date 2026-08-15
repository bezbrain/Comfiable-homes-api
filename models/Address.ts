import { model, Schema, Types } from "mongoose";

export interface IAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  mobileNumber: number;
  email: string;
  isAddress: boolean;
  createdBy: Types.ObjectId;
}

const AddressSchema = new Schema<IAddress>(
  {
    firstName: {
      type: String,
      required: [true, "First Name cannot be empty"],
    },
    lastName: {
      type: String,
      required: [true, "Last Name cannot be empty"],
    },
    address: {
      type: String,
      required: [true, "Address cannot be empty"],
    },
    city: {
      type: String,
      required: [true, "City/Town cannot be empty"],
    },
    state: {
      type: String,
      required: [true, "State cannot be empty"],
    },
    zipCode: {
      type: String,
      required: [true, "Zip Code cannot be empty"],
    },
    country: {
      type: String,
      required: [true, "Country cannot be empty"],
    },
    mobileNumber: {
      type: Number,
      required: [true, "Mobile Number cannot be empty"],
    },
    email: {
      type: String,
      required: [true, "Email Address cannot be empty"],
    },
    isAddress: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: [true, "Please, provide a user"],
    },
  },
  { timestamps: true }
);

export default model<IAddress>("Address", AddressSchema);
