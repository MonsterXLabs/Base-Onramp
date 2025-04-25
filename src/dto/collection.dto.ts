import { Types } from 'mongoose';
import { z } from 'zod';
import { UserDTOSchema } from './user.dto';

export const collectionDtoSchema = z.object({
  id: z.string().optional(),
  name: z.string().nonempty('collection name is required'),
  symbol: z.string().optional(),
  description: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  website: z.string().optional(),
  youtube: z
    .array(
      z.object({
        title: z.string().optional(),
        url: z.string().url().optional(),
      }),
    )
    .optional(),
  owner: z.instanceof(Types.ObjectId).optional(),
  descriptionImage: z.array(z.string()).optional(),
  logo: z.string().optional(),
  volume: z.number().default(0),
  likes: z.number().default(0),
  active: z.boolean().default(false),
  bannerImage: z.string().optional(),
  tokenId: z.number().default(0),
  transactionHash: z.string().optional(),
  ownerInfo: UserDTOSchema.optional(),
});

export type CollectionDTO = z.infer<typeof collectionDtoSchema>;

export const CollectionDTO = {
  convertFromEntity(entity: any): CollectionDTO {
    const { _id, ...rest } = entity;
    return {
      id: _id?.toString(),
      ...rest,
    };
  },
};
