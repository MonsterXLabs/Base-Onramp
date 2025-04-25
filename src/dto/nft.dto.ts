import { z } from 'zod';
import { Types } from 'mongoose';
import { INft } from '../entities/nft.entity';
import { UserDTOSchema } from './user.dto';
import { collectionDtoSchema } from './collection.dto';

export const nftDTOSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  jsonHash: z.string().optional(),
  uri: z.string().optional(),
  description: z.string().optional(),
  attributes: z
    .array(z.object({ type: z.string(), value: z.string() }))
    .optional(),
  mintHash: z.string().optional(),
  tokenId: z.number().optional().nullable(),
  mintedBy: z.instanceof(Types.ObjectId).optional(),
  owner: z.instanceof(Types.ObjectId).optional(),
  cloudinaryUrl: z.string().optional(),
  cloudinaryPlaceholderUrl: z.string().optional(),
  curation: z.instanceof(Types.ObjectId),
  lastPrice: z.number().optional(),
  price: z.number().optional(),
  artist: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  basicDetailsFilled: z.boolean().optional(),
  royalty: z.number().optional(),
  royaltyAddress: z.string().optional(),
  category: z.instanceof(Types.ObjectId).optional(),
  unlockableContent: z.string().optional(),
  certificates: z.array(z.string()).optional(),
  certificateNames: z.array(z.string()).optional(),
  freeMinting: z.boolean().optional(),
  advancedDetailsFilled: z.boolean().optional(),
  shipmentId: z.instanceof(Types.ObjectId).optional(),
  shipmentDetailsFilled: z.boolean().optional(),
  onSale: z.boolean().optional(),
  saleId: z.instanceof(Types.ObjectId).optional(),
  views: z.number().optional(),
  followers: z.number().optional(),
  minted: z.boolean().optional(),
  mintingTime: z.date().optional(),
  saleTime: z.date().optional(),
  shippingInformation: z
    .object({
      lengths: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      weight: z.number().optional(),
    })
    .optional(),
  likes: z.number().optional(),
  walletAddresses: z
    .array(z.object({ address: z.string(), percentage: z.number() }))
    .optional(),
  active: z.boolean().optional(),
  voucher: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  ownerInfo: UserDTOSchema.optional(),
  mintedByInfo: UserDTOSchema.optional(),
  curationInfo: collectionDtoSchema.optional(),
});

export type NftDTO = z.infer<typeof nftDTOSchema>;

export const NftDTOConverter = {
  convertFromEntity(entity: INft): NftDTO {
    const { _id, ...rest } = entity;
    const candidate: NftDTO = {
      id: _id.toString(),
      mintedBy: entity.mintedBy,
      owner: entity.owner,
      ...rest,
      shippingInformation: entity.shippingInformation
        ? {
            lengths: entity.shippingInformation.lengths ?? 0,
            width: entity.shippingInformation.width ?? 0,
            height: entity.shippingInformation.height ?? 0,
            weight: entity.shippingInformation.weight ?? 0,
          }
        : undefined,
    };
    console.log(candidate);
    return nftDTOSchema.parse(candidate);
  },
};
