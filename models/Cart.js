const { Schema, model, Types } = require("mongoose");

const CartSchema = new Schema(
  {
    productId: {
      type: String,
      required: [true, "id must be provided"],
    },
    image: {
      type: String,
      required: [true, "Image must be provided"],
    },
    name: {
      type: String,
      required: [true, "Name must be provided"],
    },
    price: {
      type: Number,
      required: [true, "Price must be provided"],
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "Users",
      required: [true, "Please provide a user"],
    },
  },
  { timestamps: true }
);

module.exports = model("Cart", CartSchema);
