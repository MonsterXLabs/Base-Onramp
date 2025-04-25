import { Schema, model, models, Document, Types } from 'mongoose';

export interface INft extends Document {
  _id: Types.ObjectId;
  name: string;
  jsonHash?: string;
  uri?: string;
  description?: string;
  attributes?: { type?: string; value?: string }[];
  mintHash?: string;
  tokenId?: number;
  mintedBy: Types.ObjectId;
  owner: Types.ObjectId;
  cloudinaryUrl?: string;
  cloudinaryPlaceholderUrl?: string;
  curation: Types.ObjectId;
  lastPrice?: number;
  price?: number;
  artist?: string;
  attachments?: string[];
  basicDetailsFilled?: boolean;
  royalty?: number;
  royaltyAddress?: string;
  category?: Types.ObjectId;
  unlockableContent?: string;
  certificates?: string[];
  certificateNames?: string[];
  freeMinting?: boolean;
  advancedDetailsFilled?: boolean;
  shipmentId?: Types.ObjectId;
  shipmentDetailsFilled?: boolean;
  onAuction?: boolean;
  auctionId?: Types.ObjectId;
  onSale?: boolean;
  saleId?: Types.ObjectId;
  views?: number;
  followers?: number;
  minted?: boolean;
  mintingTime?: Date;
  saleTime?: Date;
  shippingInformation?: {
    lengths?: number;
    width?: number;
    height?: number;
    weight?: number;
  };
  likes?: number;
  walletAddresses?: { address?: string; percentage?: number }[];
  active?: boolean;
  voucher?: string;
}

const nftSchema = new Schema<INft>(
  {
    name: {
      type: String,
      required: [true, 'NFT name is required'],
    },
    jsonHash: { type: String },
    uri: {
      type: String,
    },
    description: {
      type: String,
    },
    attributes: [
      {
        type: {
          type: String,
        },
        value: {
          type: String,
        },
      },
    ],
    mintHash: { type: String },
    tokenId: { type: Number },
    mintedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cloudinaryUrl: {
      type: String,
    },
    cloudinaryPlaceholderUrl: {
      type: String,
    },
    curation: {
      type: Schema.Types.ObjectId,
      ref: 'Collection',
      required: true,
    },
    lastPrice: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      default: 0,
    },
    artist: {
      type: String,
    },
    attachments: {
      type: [
        {
          type: String,
        },
      ],
    },
    basicDetailsFilled: {
      type: Boolean,
      default: false,
    },
    royalty: {
      type: Number,
    },
    royaltyAddress: {
      type: String,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Categories',
    },
    unlockableContent: {
      type: String,
    },
    certificates: [
      {
        type: String,
      },
    ],
    certificateNames: [
      {
        type: String,
      },
    ],
    freeMinting: {
      type: Boolean,
      default: false,
    },
    advancedDetailsFilled: {
      type: Boolean,
    },
    shipmentId: {
      type: Schema.Types.ObjectId,
      ref: 'ShippingAddress',
    },
    shipmentDetailsFilled: {
      type: Boolean,
    },
    onAuction: {
      type: Boolean,
      default: false,
    },
    auctionId: {
      type: Schema.Types.ObjectId,
      ref: 'Auction',
      default: null,
    },
    onSale: {
      type: Boolean,
      default: false,
    },
    saleId: {
      type: Schema.Types.ObjectId,
      ref: 'Sale',
      default: null,
    },
    views: {
      type: Number,
      default: 0,
    },
    followers: {
      type: Number,
      default: 0,
    },
    minted: {
      type: Boolean,
      default: false,
    },
    mintingTime: {
      type: Date,
    },
    saleTime: {
      type: Date,
    },
    shippingInformation: {
      lengths: {
        type: Number,
        default: 0,
      },
      width: {
        type: Number,
        default: 0,
      },
      height: {
        type: Number,
        default: 0,
      },
      weight: {
        type: Number,
        default: 0,
      },
    },
    likes: {
      type: Number,
      default: 0,
    },
    walletAddresses: [
      {
        address: {
          type: String,
        },
        percentage: {
          type: Number,
        },
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
    voucher: {
      type: String,
    },
  },
  { timestamps: true },
);

models.Nft = models.Nft || model<INft>('Nft', nftSchema);
export const NftModel = models.Nft;
