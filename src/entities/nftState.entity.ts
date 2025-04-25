import { Document, Types, Schema, model, models } from 'mongoose';
import { IUser } from './user.entity';

export interface INftState extends Document {
  nftId: Types.ObjectId;
  state: string;
  from?: IUser['_id'];
  fromWallet?: string;
  to?: Types.ObjectId;
  toWallet?: string;
  actionHash?: string;
  price?: number;
  currency?: string;
}

const NftStateSchema = new Schema<INftState>(
  {
    nftId: {
      type: Schema.Types.ObjectId,
      ref: 'Nft',
      required: true,
    },
    state: { type: String, required: true }, // Mint, Transfer
    from: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    fromWallet: {
      type: String,
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    toWallet: {
      type: String,
    },
    actionHash: { type: String },
    price: {
      type: Number,
    },
    currency: {
      type: String,
    },
  },
  { timestamps: true },
);

models.NftState =
  models.NftState || model<INftState>('NftState', NftStateSchema);

export const NftStateModel = models.NftState;
