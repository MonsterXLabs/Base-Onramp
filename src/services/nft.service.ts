import { Types } from 'mongoose';
import { NftDTO, NftDTOConverter } from '@/dto/nft.dto';
import { INft, NftModel } from '@/entities/nft.entity';
import { UserDTOConverter } from '@/dto/user.dto';
import { connectMongoose } from '@/modules/mongodb.module';
import { UserModel } from '@/entities/user.entity';
import { CollectionModel } from '@/entities/collection.entity';
import { CollectionDTO } from '@/dto/collection.dto';
import { Service } from 'typedi';

@Service()
export class NftService {
  async getNftByQuery(query): Promise<NftDTO | null> {
    await connectMongoose();
    const nft = await NftModel.findOne(query)
      .populate({ path: 'owner', model: UserModel })
      .populate({ path: 'mintedBy', model: UserModel })
      .populate({ path: 'curation', model: CollectionModel })
      .exec();

    if (!nft) {
      return null;
    }

    const { owner, mintedBy, curation, ...nftObj } = nft.toObject();

    // Convert entity to DTO
    const nftDto = NftDTOConverter.convertFromEntity({
      ...nftObj,
      owner: new Types.ObjectId(owner._id),
      mintedBy: new Types.ObjectId(mintedBy._id),
      ...(curation && { curation: new Types.ObjectId(curation._id) }),
    } as INft);

    // Add user information to DTO
    nftDto.ownerInfo = UserDTOConverter.convertFromEntity(owner);
    nftDto.mintedByInfo = UserDTOConverter.convertFromEntity(mintedBy);
    nftDto.curationInfo = CollectionDTO.convertFromEntity(curation);
    return nftDto;
  }

  async getNftById(id: string): Promise<NftDTO | null> {
    return this.getNftByQuery({ _id: new Types.ObjectId(id) });
  }
}
