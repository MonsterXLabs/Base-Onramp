import { INftState } from '@/entities/nftState.entity';
import { NftDTO, NftDTOConverter } from './nft.dto';
import { INft } from '@/entities/nft.entity';
import { Populated } from '@/types';
import { IUser } from '@/entities/user.entity';
import { UserDTO, UserDTOConverter } from './user.dto';
import { Types } from 'mongoose';

export type NftStateDTO = {
  id?: string;
  nftId: Partial<NftDTO>;
  state: string;
  from?: Partial<UserDTO>;
  fromWallet?: string;
  to?: Partial<UserDTO>;
  toWallet?: string;
  actionHash?: string;
  price?: number;
  currency?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export const NftStateDTOConverter = {
  fromEntity(
    entity: Populated<
      INftState,
      {
        nftId: INft | INft['_id'];
        from: IUser | IUser['_id'];
        to: IUser | IUser['_id'];
      }
    >,
  ): NftStateDTO {
    const { _id, nftId, from, to, ...rest } = entity;

    const convertEntity = <T, U>(
      entity: T | Types.ObjectId,
      converter: (e: T) => U,
    ): U | { id: string } | undefined => {
      if (entity && !(entity instanceof Types.ObjectId)) {
        return converter(entity as T);
      }
      return entity ? { id: (entity as Types.ObjectId).toString() } : undefined;
    };

    const nftDto = convertEntity(nftId, NftDTOConverter.convertFromEntity);
    const fromDto = convertEntity(from, UserDTOConverter.convertFromEntity);
    const toDto = convertEntity(to, UserDTOConverter.convertFromEntity);

    return {
      id: _id?.toString() || '',
      nftId: nftDto,
      from: fromDto,
      to: toDto,
      ...rest,
    } as NftStateDTO;
  },
};
