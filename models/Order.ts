import { Schema, model, Types } from "mongoose";

export type OrderStatus = "open" | "closed";

export interface IOrderItem {
  productId: string;
  type: string;
  image: string;
  brand?: string;
  category?: string;
  sku?: string;
  price: number;
  counter: number;
}

export interface IOrderAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  mobileNumber: string | number;
  email?: string;
}

export interface IOrder {
  createdBy: Types.ObjectId;
  status: OrderStatus;
  items: IOrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  email?: string;
  address?: IOrderAddress;
  reference?: string;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    type: { type: String, required: true },
    image: { type: String, required: true },
    brand: String,
    category: String,
    sku: String,
    price: { type: Number, required: true },
    counter: { type: Number, required: true, default: 1 },
  },
  { _id: false }
);

const OrderAddressSchema = new Schema<IOrderAddress>(
  {
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
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: [true, "Please provide a user"],
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    items: {
      type: [OrderItemSchema],
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    email: String,
    address: OrderAddressSchema,
    reference: String,
  },
  { timestamps: true }
);

export default model<IOrder>("Order", OrderSchema);
