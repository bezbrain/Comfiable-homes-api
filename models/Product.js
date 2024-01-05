const { Schema, model } = require("mongoose");

const ProductSchema = new Schema(
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
  },
  { timestamps: true }
);

module.exports = model("Products", ProductSchema);
