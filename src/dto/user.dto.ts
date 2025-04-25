import { z } from 'zod';
import { IUser } from '../entities/user.entity';

export const UserDTOSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  username: z.string().optional(),
  wallet: z.string(),
  avatar: z
    .object({
      public_id: z.string().optional(),
      url: z.string().optional(),
    })
    .optional(),
  banner: z
    .object({
      public_id: z.string().optional(),
      url: z.string().optional(),
    })
    .optional(),
  userType: z.number().int().min(1).max(3).default(1),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional(),
  bio: z.string().default(''),
  instagram: z.string().default(''),
  facebook: z.string().default(''),
  twitter: z.string().default(''),
  website: z.string().default(''),
  active: z.boolean().default(true),
  isAdmin: z.boolean().default(false),
  isCurator: z.boolean().default(false),
  lies: z.number().int().default(0),
});

export type UserDTO = z.infer<typeof UserDTOSchema>;

export const UserDTOConverter = {
  convertFromEntity(entity: IUser): UserDTO {
    const { _id, ...rest } = entity;
    const candidate: UserDTO = {
      id: _id.toHexString(),
      ...rest,
    };
    return UserDTOSchema.parse(candidate);
  },
};
