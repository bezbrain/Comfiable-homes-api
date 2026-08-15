import { Schema, model, Types } from "mongoose";
import { IOrderAddress, IOrderItem } from "./Order";

export type TransactionStatus = "pending" | "success" | "failed";

/**
 * A Transaction is our local record of one Paystack attempt.
 *
 * We save the cart + address *before* the shopper leaves for Paystack.
 * That way, when they come back (or the webhook arrives), we can create
 * the order even if the cart has changed.
 */
export interface ITransaction {
  email: string;
  amount: number;
  reference: string;
  status: TransactionStatus;
  createdBy: Types.ObjectId;
  items: IOrderItem[];
  address?: IOrderAddress;
  shippingFee: number;
  subtotal: number;
  total: number;
  orderId?: Types.ObjectId;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    email: {
      type: String,
      required: [true, "Email cannot be empty"],
    },
    amount: {
      type: Number,
      required: [true, "Amount cannot be empty"],
    },
    // Paystack references look like "q3k3j9x..." — they are strings, not numbers.
    reference: {
      type: String,
      required: [true, "Reference cannot be empty"],
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    items: {
      type: [
        {
          productId: { type: String },
          // `type` is the product name in this shop. Nest it so Mongoose
          // does not treat the word `type` as a schema keyword.
          type: { type: String },
          image: { type: String },
          brand: { type: String },
          category: { type: String },
          sku: { type: String },
          price: { type: Number },
          counter: { type: Number },
        },
      ],
      default: [],
    },
    address: {
      firstName: String,
      lastName: String,
      address: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      mobileNumber: Schema.Types.Mixed,
      email: String,
    },
    shippingFee: {
      type: Number,
      default: 0,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
  },
  { timestamps: true }
);

export default model<ITransaction>("Transaction", TransactionSchema);
