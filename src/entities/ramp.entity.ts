import { Document, Schema, model, models, Types } from 'mongoose';
import { Address } from 'thirdweb';

export interface IRamp extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  country: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    postalCode: string;
  };
  phoneNumber: string;
  contactInformation?: string;
  concent?: string;
  type: 'moonpay' | 'coinbase';
  buyerWallet: Address;
  nftId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const RampSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    country: { type: String, required: true },
    address: {
      line1: { type: String, required: true },
      line2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    phoneNumber: { type: String, required: true },
    contactInformation: { type: String },
    concent: { type: String },
    type: { type: String, enum: ['moonpay', 'coinbase'], required: true },
    buyerWallet: { type: String, required: true },
    nftId: { type: Types.ObjectId, required: true, ref: 'NFT' },
  },
  {
    timestamps: true,
  },
);

models.Ramp = models.Ramp || model<IRamp>('Ramp', RampSchema);

export const RampModel = models.Ramp;
