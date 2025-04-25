import { Document, models, model, Types, Schema } from 'mongoose';

const CollectionSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'collection name is required'],
      unqiue: true,
    },
    symbol: { type: String },
    description: {
      type: String,
    },
    instagram: {
      type: String,
    },
    facebook: {
      type: String,
    },
    twitter: {
      type: String,
    },
    website: {
      type: String,
    },
    youtube: [
      {
        title: String,
        url: String,
      },
    ],
    owner: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    descriptionImage: [
      {
        type: String,
      },
    ],
    logo: {
      type: String,
    },
    volume: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: false,
    },
    bannerImage: {
      type: String,
    },
    tokenId: {
      type: Number,
      default: 0,
    },
    transactionHash: {
      type: String,
    },
  },
  { timestamps: true },
);

export interface ICollection extends Document {
  name: string;
  symbol?: string;
  description?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  website?: string;
  youtube?: { title: string; url: string }[];
  owner: Types.ObjectId;
  descriptionImage?: string[];
  logo?: string;
  volume: number;
  likes: number;
  active: boolean;
  bannerImage?: string;
  tokenId: number;
  transactionHash?: string;
}

models.Collection =
  models.Collection || model<ICollection>('Collection', CollectionSchema);
export const CollectionModel = models.Collection;
