import { z } from 'zod';
import { nftDTOSchema } from './nft.dto';
import { UserDTOSchema } from './user.dto';

export const auctionDTOSchema = z.object({
  id: z.string().optional(),
  status: z.enum(['pending', 'active', 'completed', 'cancelled']),
  nftId: z.string(),
  minBid: z.number(),
  duration: z.number(),
  actionHash: z.string().optional(),
  auctionId: z.number().optional(),
  bidWinnerId: z.string().optional(),
  highBid: z.number().optional(),
  highBidAmount: z.number().optional(),
  nftDetail: nftDTOSchema.optional(),
  bidWinner: UserDTOSchema.optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  endTime: z.number().optional(),
  tokenId: z.number().optional(),
});

export type AuctionDTO = z.infer<typeof auctionDTOSchema>;

export const getAuctionDTOSchema = auctionDTOSchema.extend({
  bidCount: z.number(),
  winBidAmount: z.number(),
});

export type GetAuctionDTO = z.infer<typeof getAuctionDTOSchema>;

export const AuctionDTOConverter = {
  convertFromEntity(entity: any): AuctionDTO {
    const { _id, nftId, bidWinnerId, ...rest } = entity;
    return {
      id: _id?.toString() || '',
      nftId: nftId.toString() || '',
      bidWinnerId: bidWinnerId?.toString() || '',
      ...rest,
    };
  },
};

export const cancelAuctionDTOSchema = z.object({
  nftId: z.string(),
  auctionId: z.number(),
  actionHash: z.string(),
});

export type CancelAuctionDTO = z.infer<typeof cancelAuctionDTOSchema>;

export const completeAuctionDTOSchema = cancelAuctionDTOSchema;

export type CompleteAuctionDTO = z.infer<typeof completeAuctionDTOSchema>;
