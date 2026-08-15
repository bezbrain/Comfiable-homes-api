import { Schema, model } from "mongoose";

export interface ITransaction {
  email: string;
  amount: number;
  reference: number;
}

const TransactionSchema = new Schema<ITransaction>({
  email: {
    type: String,
    required: [true, "Email cannot be empty"],
  },
  amount: {
    type: Number,
    required: [true, "Amount cannot be empty"],
  },
  reference: {
    type: Number,
    required: [true, "Reference number cannot be empty"],
  },
});

export default model<ITransaction>("Transaction", TransactionSchema);
