import { Schema, model, models, Document, Types } from 'mongoose';

export interface IBid extends Document {
  nftId: Schema.Types.ObjectId;
  bidId?: number;
  bidValue: number;
  tokenValue?: number;
  bidder?: Schema.Types.ObjectId;
  duration?: number;
  bidHash?: string;
  bidSuccess?: boolean;
  bidCancelled?: boolean;
  bidderShippingId?: Schema.Types.ObjectId;
}

const bidSchema = new Schema<IBid>(
  {
    nftId: {
      type: Types.ObjectId,
      ref: 'Nft',
      required: true,
    },
    bidId: {
      type: Number,
    },
    bidValue: {
      type: Number,
      required: [true, 'Please enter the bid value'],
    },
    tokenValue: {
      type: Number,
    },
    bidder: {
      type: Types.ObjectId,
      ref: 'User',
    },
    duration: {
      type: Number,
    },
    bidHash: {
      type: String,
    },
    bidSuccess: {
      type: Boolean,
      default: false,
    },
    bidCancelled: {
      type: Boolean,
      default: false,
    },
    bidderShippingId: {
      type: Types.ObjectId,
      ref: 'ShippingAddress',
    },
  },
  { timestamps: true },
);

models.Bid = models.Bid || model<IBid>('Bid', bidSchema);

export const BidModel = models.Bid;
