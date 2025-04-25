import { Document, Types, Schema, model, models } from 'mongoose';

export const SaleStatus = {
  NotForSale: 'NotForSale',
  Active: 'Active',
  Ordered: 'Ordered',
  Dispute: 'Dispute',
  CancellationRequested: 'CancellationRequested',
  Sold: 'Sold',
  Cancelled: 'Cancelled',
  Auction: 'Auction',
};

export type SaleStatusType = {
  NotForSale: 'NotForSale';
  Active: 'Active';
  Ordered: 'Ordered';
  Dispute: 'Dispute';
  CancellationRequested: 'CancellationRequested';
  Sold: 'Sold';
  Cancelled: 'Cancelled';
  Auction: 'Auction';
};

export interface ISale extends Document {
  _id: Types.ObjectId;
  saleStatus: SaleStatusType;
  saleStartOn?: Date;
  saleStartTxnHash?: string;
  itemPurchasedOn?: Date;
  itemPurchasedTxnHash?: string;
  saleEndedOn?: Date;
  saleEndTxnHash?: string;
  saleCancelledOn?: Date;
  saleCancelTxnHash?: string;
  requestEscrowReleaseTxnHash?: string;
  nftId: Types.ObjectId;
  sellerId: Types.ObjectId;
  active: boolean;
  released: boolean;
  saleWinner?: Types.ObjectId;
  itemDelivered: boolean;
  sellerShippingId?: Types.ObjectId;
  buyerShippingId?: Types.ObjectId;
  cancelRequest?: string;
  cancelAttachment?: string[];
  requestEscrowRelease: boolean;
  requestEscrowId?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SaleDto {
  id: string;
  saleStatus: SaleStatusType;
  saleStartOn?: Date;
  saleStartTxnHash?: string;
  itemPurchasedOn?: Date;
  itemPurchasedTxnHash?: string;
  saleEndedOn?: Date;
  saleEndTxnHash?: string;
  saleCancelledOn?: Date;
  saleCancelTxnHash?: string;
  requestEscrowReleaseTxnHash?: string;
  nftId: string;
  sellerId: string;
  active: boolean;
  released: boolean;
  saleWinner?: string;
  itemDelivered: boolean;
  sellerShippingId?: string;
  buyerShippingId?: string;
  cancelRequest?: string;
  cancelAttachment?: string[];
  requestEscrowRelease: boolean;
  requestEscrowId?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(sale: ISale) {
    this.id = sale._id.toHexString();
    this.saleStatus = sale.saleStatus;
    this.saleStartOn = sale.saleStartOn;
    this.saleStartTxnHash = sale.saleStartTxnHash;
    this.itemPurchasedOn = sale.itemPurchasedOn;
    this.itemPurchasedTxnHash = sale.itemPurchasedTxnHash;
    this.saleEndedOn = sale.saleEndedOn;
    this.saleEndTxnHash = sale.saleEndTxnHash;
    this.saleCancelledOn = sale.saleCancelledOn;
    this.saleCancelTxnHash = sale.saleCancelTxnHash;
    this.requestEscrowReleaseTxnHash = sale.requestEscrowReleaseTxnHash;
    this.nftId = sale.nftId.toHexString();
    this.sellerId = sale.sellerId.toHexString();
    this.active = sale.active;
    this.released = sale.released;
    this.saleWinner = sale.saleWinner?.toHexString();
    this.itemDelivered = sale.itemDelivered;
    this.sellerShippingId = sale.sellerShippingId?.toHexString();
    this.buyerShippingId = sale.buyerShippingId?.toHexString();
    this.cancelRequest = sale.cancelRequest;
    this.cancelAttachment = sale.cancelAttachment;
    this.requestEscrowRelease = sale.requestEscrowRelease;
    this.requestEscrowId = sale.requestEscrowId?.toHexString();
    this.createdAt = sale.createdAt;
    this.updatedAt = sale.updatedAt;
  }
}

const SaleSchema = new Schema<ISale>(
  {
    saleStatus: {
      type: String,
      enum: Object.values(SaleStatus),
      required: true,
    },
    saleStartOn: { type: Date },
    saleStartTxnHash: { type: String },
    itemPurchasedOn: { type: Date },
    itemPurchasedTxnHash: { type: String },
    saleEndedOn: { type: Date },
    saleEndTxnHash: { type: String },
    saleCancelledOn: { type: Date },
    saleCancelTxnHash: { type: String },
    requestEscrowReleaseTxnHash: { type: String },
    nftId: {
      type: Schema.Types.ObjectId,
      ref: 'Nft',
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    active: { type: Boolean, required: true, default: false },
    released: { type: Boolean, required: true, default: false },
    saleWinner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    itemDelivered: { type: Boolean, required: true, default: false },
    sellerShippingId: {
      type: Schema.Types.ObjectId,
      ref: 'ShippingAddress',
    },
    buyerShippingId: {
      type: Schema.Types.ObjectId,
      ref: 'ShippingAddress',
    },
    cancelRequest: { type: String },
    cancelAttachment: { type: [String] },
    requestEscrowRelease: { type: Boolean, required: true, default: false },
    requestEscrowId: {
      type: Schema.Types.ObjectId,
      ref: 'Dispute',
    },
  },
  {
    timestamps: true,
  },
);

models.Sale = models.Sale || model<ISale>('Sale', SaleSchema);

export const SaleModel = models.Sale;
