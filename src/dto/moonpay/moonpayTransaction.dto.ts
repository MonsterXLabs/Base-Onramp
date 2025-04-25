import { IMoonpayTransaction } from '@/entities/moonpayTransaction.entity';
import { Types } from 'mongoose';
import { z } from 'zod';

export const moonpayTransactionDtoSchema = z.object({
  id: z.string().optional(),
  mode: z.string().nonempty(),
  buyerWalletAddress: z.string().nonempty(),
  priceCurrencyCode: z.string(),
  price: z.number(),
  quantity: z.number(),
  sellerWalletAddress: z.string().optional(),
  listingId: z.string().optional(),
  status: z.enum(['pending', 'completed', 'failed']).default('pending'),
  transactionHash: z.array(z.string()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type MoonpayTransactionDTO = {
  id?: string;
  mode: string;
  buyerWalletAddress: string;
  priceCurrencyCode: string;
  price: number;
  quantity: number;
  sellerWalletAddress?: string;
  listingId?: string;
  transactionHash?: string[];
  tokenId?: string[];
  status: 'pending' | 'completed' | 'failed';
  createdAt?: Date;
  updatedAt?: Date;
};

export interface TransactionStatusResponse {
  id: string;
  status: 'completed' | 'failed' | 'pending';
  transactionHash?: string[];
  statusChangedAt: string;
  failureReason?: string;
  tokenId?: string[];
}

export const MoonpayTransactionDTO = {
  convertFromEntity(entity: IMoonpayTransaction): MoonpayTransactionDTO {
    const { _id, listingId, ...rest } = entity;
    return {
      id: _id?.toString() || '',
      listingId: listingId.toString() || '',
      ...rest,
    } as MoonpayTransactionDTO;
  },
  convertToEntity(
    dto: Partial<MoonpayTransactionDTO>,
  ): Partial<IMoonpayTransaction> {
    const { id, listingId, ...rest } = dto;
    return {
      _id: id ? new Types.ObjectId(id) : undefined,
      listingId: listingId ? new Types.ObjectId(listingId) : undefined,
      ...rest,
    } as Partial<IMoonpayTransaction>;
  },
  convertToStatusResponse(
    dto: MoonpayTransactionDTO,
  ): TransactionStatusResponse {
    return {
      id: dto.id || '',
      status: dto.status,
      transactionHash: dto.transactionHash,
      statusChangedAt: dto?.updatedAt?.toISOString() || '',
      failureReason: dto.status === 'failed' ? 'Unknown error' : undefined,
      tokenId: dto.tokenId,
    };
  },
};
