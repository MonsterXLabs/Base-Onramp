import { NftStateDTO, NftStateDTOConverter } from '@/dto/nftState.dto';
import { NftModel } from '@/entities/nft.entity';
import { NftStateModel } from '@/entities/nftState.entity';
import { UserModel } from '@/entities/user.entity';
import { connectMongoose } from '@/modules/mongodb.module';
import { Types } from 'mongoose';
import { Service } from 'typedi';

@Service()
export default class NftStateService {
  async getNftStateByQuery(query): Promise<NftStateDTO | null> {
    await connectMongoose();
    const nftState = await NftStateModel.findOne(query)
      .populate({ path: 'nftId', model: NftModel })
      .populate({ path: 'from', model: UserModel })
      .populate({ path: 'to', model: UserModel })
      .exec();

    if (!nftState) {
      return null;
    }

    // Convert entity to DTO
    const nftStateDto = NftStateDTOConverter.fromEntity(nftState.toObject());
    return nftStateDto;
  }

  async getNftStateById(id: string): Promise<NftStateDTO | null> {
    return this.getNftStateByQuery({ _id: new Types.ObjectId(id) });
  }

  async getNftSatesByIds(ids: string[]): Promise<NftStateDTO[] | null> {
    await connectMongoose();
    const nftStates = await NftStateModel.find({ _id: { $in: ids } })
      .populate({ path: 'nftId', model: NftModel })
      .populate({ path: 'from', model: UserModel })
      .populate({ path: 'to', model: UserModel })
      .exec();

    if (!nftStates) {
      return null;
    }

    return nftStates.map((nftState) =>
      NftStateDTOConverter.fromEntity(nftState.toObject()),
    );
  }
}
