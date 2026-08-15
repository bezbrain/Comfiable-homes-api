import { Schema, model, Types } from "mongoose";
import { IProductDetails } from "./Product";

export interface ICart {
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
  createdBy: Types.ObjectId;
  productId: string;
  isIncreaseBlur: boolean;
  isDecreaseBlur: boolean;
}

const CartSchema = new Schema<ICart>(
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
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: [true, "Please provide a user"],
    },
    productId: {
      type: String,
      required: [true, "id must be provided"],
    },
    isIncreaseBlur: {
      type: Boolean,
      default: false,
    },
    isDecreaseBlur: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default model<ICart>("Cart", CartSchema);
