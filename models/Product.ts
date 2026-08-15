import { Schema, model } from "mongoose";

export interface IProductDetails {
  name: string;
  rating: number;
  reviews?: string;
  content: string;
  available: string;
  sku: string;
  brand: string;
}

export interface IProduct {
  category: string;
  image: string;
  type: string;
  price: number;
  reviews?: string;
  content: string;
  available: string;
  sku: string;
  brand: string;
  details: IProductDetails;
  isInCart: boolean;
  isInStock: boolean;
  counter: number;
}

const ProductSchema = new Schema<IProduct>(
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

export default model<IProduct>("Products", ProductSchema);
