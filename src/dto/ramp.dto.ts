import { IRamp } from '@/entities/ramp.entity';
import { Address, isAddress } from 'thirdweb';
import { z } from 'zod';

export const rampDtoSchema = z.object({
  _id: z.string().optional(),
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
  contactInformation: z.string().optional(),
  concent: z.string().optional(),
  type: z.enum(['moonpay', 'coinbase']),
  buyerWallet: z.string().refine(isAddress, {
    message: 'Invalid web3 wallet address',
  }),
  nftId: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type RampDTO = {
  id?: string;
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
  nftId: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export const RampDTO = {
  fromEntity(entity: IRamp): RampDTO {
    const { _id, nftId, ...rest } = entity;
    return {
      id: entity._id.toString(),
      nftId: nftId.toString() || '',
      ...rest,
    } as RampDTO;
  },
};
