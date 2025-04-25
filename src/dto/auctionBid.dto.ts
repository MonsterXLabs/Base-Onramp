import { z } from 'zod';
import { auctionDTOSchema } from './auction.dto';
import { nftDTOSchema } from './nft.dto';
import { UserDTOSchema } from './user.dto';
import { IAuctionBid } from '@/entities/auctionBid.entity';
import { Types } from 'mongoose';
import { shortenAddress } from 'thirdweb/utils';
import { wallets } from '../lib/client';
import { Address } from 'viem';
import { IShippingAddress } from '@/entities/shippingAddress';

export const shippingAddressSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  country: z.string(),
  address: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
  }),
  phoneNumber: z.string(),
  contactInformation: z.string(),
  concent: z.string().optional(),
  termAccepted: z.boolean().optional(),
  nftId: z.string().optional(),
});

export type ShippingAddressDTO = z.infer<typeof shippingAddressSchema>;

export const auctionBidDTOSchema = z.object({
  id: z.string().optional(),
  nftId: z.string(),
  auctionId: z.string(),
  bidValue: z.number(),
  tokenValue: z.number().optional(),
  bidder: z.string().optional(),
  bidHash: z.string().optional(),
  bidderShippingId: z.string().optional(),
  auctionDetail: auctionDTOSchema.optional(),
  nftDetail: nftDTOSchema.optional(),
  bidderDetail: UserDTOSchema.optional(),
  bidderShippingDetail: shippingAddressSchema.optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const getAuctionBidSchema = z.object({
  id: z.string().optional(),
  bidValue: z.number(),
  tokenValue: z.number(),
  from: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type AucitonBidDTO = z.infer<typeof auctionBidDTOSchema>;

export type GETAuctionBidDTO = z.infer<typeof getAuctionBidSchema>;
export const AuctionBidDTOConverter = {
  convertFromEntity(entity: IAuctionBid): AucitonBidDTO {
    const { _id, auctionId, nftId, bidder, bidderShippingId, ...rest } = entity;
    return {
      ...rest,
      id: _id?.toString(),
      auctionId: auctionId?.toString() || '',
      nftId: nftId?.toString() || '',
      bidder: bidder?.toString() || '',
      bidderShippingId: bidderShippingId?.toString() || '',
    };
  },

  convertFromDto(dto: AucitonBidDTO): IAuctionBid {
    const { auctionId, nftId, bidder, bidderShippingId, id, ...rest } = dto;
    return {
      ...rest,
      _id: id ? new Types.ObjectId(id) : new Types.ObjectId(),
      auctionId: new Types.ObjectId(auctionId),
      nftId: new Types.ObjectId(nftId),
      bidder: new Types.ObjectId(bidder),
      bidderShippingId: new Types.ObjectId(bidderShippingId),
    } as unknown as IAuctionBid;
  },
  convertToGetDto(dto: AucitonBidDTO): GETAuctionBidDTO {
    const { id, bidValue, tokenValue, bidderDetail, createdAt, updatedAt } =
      dto;
    return {
      id,
      bidValue,
      tokenValue,
      from:
        bidderDetail?.username ??
        (bidderDetail?.wallet
          ? shortenAddress(bidderDetail.wallet as Address)
          : ''),
      createdAt,
      updatedAt,
    };
  },
};

export const shippingAddressDTOConverter = {
  convertFromEntity(entity: IShippingAddress): ShippingAddressDTO {
    const { _id, nftId, ...rest } = entity;
    return {
      ...rest,
      id: _id?.toString(),
      nftId: nftId?.toString() || '',
    };
  },
};

export const createAuctionBidDTOSchema = z.object({
  nftId: z.string(),
  auctionId: z.number(),
  bidValue: z.number(),
  bidder: z.string(),
  bidHash: z.string(),
  bidderShippingDetail: shippingAddressSchema,
});

export type createAuctionBidDTO = z.infer<typeof createAuctionBidDTOSchema>;
