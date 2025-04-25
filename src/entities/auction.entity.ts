import { Schema, model, models, Document, Types } from 'mongoose';

export interface IAuction extends Document {
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  nftId: Schema.Types.ObjectId;
  minBid: number;
  duration: number;
  actionHash?: string;
  auctionId: number;
  bidWinnerId: Schema.Types.ObjectId;
  highBid: number;
  highBidAmount: number;
  endTime: number;
}

const auctionSchema = new Schema<IAuction>(
  {
    status: {
      type: String,
      required: true,
      enum: ['pending', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
    nftId: {
      type: Types.ObjectId,
      ref: 'NFT',
      required: true,
    },
    minBid: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    actionHash: {
      type: String,
    },
    auctionId: {
      type: Number,
    },
    bidWinnerId: {
      type: Types.ObjectId,
      ref: 'User',
      default: null,
    },
    highBid: {
      type: Number,
    },
    highBidAmount: {
      type: Number,
    },
    endTime: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

models.Auction = models.Auction || model<IAuction>('Auction', auctionSchema);
export const AuctionModel = models.Auction;
