import { Schema, model, models, Document, Types } from 'mongoose';

export interface IAuctionBid extends Document {
  nftId: Schema.Types.ObjectId;
  auctionId: Schema.Types.ObjectId;
  bidValue: number;
  tokenValue?: number;
  bidder?: Schema.Types.ObjectId;
  bidHash?: string;
  bidderShippingId?: Schema.Types.ObjectId;
}

const auctionBidSchema = new Schema<IAuctionBid>(
  {
    nftId: {
      type: Types.ObjectId,
      ref: 'Nft',
      required: true,
    },
    auctionId: {
      type: Types.ObjectId,
      ref: 'Auction',
      required: true,
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
    bidHash: {
      type: String,
    },
    bidderShippingId: {
      type: Types.ObjectId,
      ref: 'ShippingAddress',
    },
  },
  { timestamps: true },
);

models.AuctionBid =
  models.AuctionBid || model<IAuctionBid>('AuctionBid', auctionBidSchema);

export const AuctionBidModel = models.AuctionBid;
