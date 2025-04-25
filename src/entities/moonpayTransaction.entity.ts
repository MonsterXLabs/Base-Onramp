import { Document, Schema, model, models, Types } from 'mongoose';

export interface IMoonpayTransaction extends Document {
  _id: Types.ObjectId;
  mode: string;
  buyerWalletAddress: string;
  priceCurrencyCode: string;
  price: number;
  quantity: number;
  sellerWalletAddress?: string;
  listingId?: Types.ObjectId;
  transactionHash?: string[];
  tokenId?: string[];
  status: 'pending' | 'completed' | 'failed';
  createdAt?: Date;
  updatedAt?: Date;
}

const MoonpayTransactionSchema: Schema = new Schema(
  {
    mode: { type: String, required: true },
    buyerWalletAddress: { type: String, required: true },
    priceCurrencyCode: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    sellerWalletAddress: { type: String },
    listingId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    transactionHash: [{ type: String }],
    tokenId: [{ type: String }],
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true },
);

models.MoonpayTransaction =
  models.MoonpayTransaction ||
  model<IMoonpayTransaction>('MoonpayTransaction', MoonpayTransactionSchema);
export const MoonpayTransactionModel = models.MoonpayTransaction;
