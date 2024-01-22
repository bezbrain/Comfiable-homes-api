const { model, Schema, Types } = require("mongoose");

const AddressSchema = new Schema(
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
    zipCode: {
      type: String,
      required: [true, "Zip Code cannot be empty"],
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
      type: Types.ObjectId,
      ref: "Users",
      required: [true, "Please, provide a user"],
    },
  },
  { timestamps: true }
);

module.exports = model("Address", AddressSchema);
