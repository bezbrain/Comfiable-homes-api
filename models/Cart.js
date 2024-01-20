const { Schema, model, Types } = require("mongoose");

const CartSchema = new Schema(
  // {
  //   productId: {
  //     type: String,
  //     required: [true, "id must be provided"],
  //   },
  //   image: {
  //     type: String,
  //     required: [true, "Image must be provided"],
  //   },
  //   name: {
  //     type: String,
  //     required: [true, "Name must be provided"],
  //   },
  //   price: {
  //     type: Number,
  //     required: [true, "Price must be provided"],
  //   },
  //   createdBy: {
  //     type: Types.ObjectId,
  //     ref: "Users",
  //     required: [true, "Please provide a user"],
  //   },
  // },
  // { timestamps: true }
  {
    category: {
      type: String,
      required: [true, "Please provide category"],
    },
    image: {
      type: String,
      required: [true, "Please provide Image"],
    },
    type: {
      type: String,
      required: [true, "Please provide type"],
    },
    price: {
      type: Number,
      required: [true, "Please provide price"],
    },
    reviews: String,
    content: {
      type: String,
      required: [true, "Please provide content"],
    },
    available: {
      type: String,
      required: [true, "Please provide availability"],
    },
    sku: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: [true, "Please provide brand"],
    },
    details: {
      name: {
        type: String,
        required: [true, "Please provide name"],
      },
      rating: {
        type: Number,
        required: [true, "Please provide rating"],
      },
      reviews: String,
      content: {
        type: String,
        required: [true, "Please provide content"],
      },
      available: {
        type: String,
        required: [true, "Please provide availability"],
      },
      sku: {
        type: String,
        required: true,
      },
      brand: {
        type: String,
        required: [true, "Please provide brand"],
      },
    },
    isInCart: {
      type: Boolean,
      default: false,
    },
    isInStock: {
      type: Boolean,
      default: true,
    },
    counter: {
      type: Number,
      default: 1,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "Users",
      required: [true, "Please provide a user"],
    },
    productId: {
      type: String,
      required: [true, "id must be provided"],
    },
    isBlur: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = model("Cart", CartSchema);
