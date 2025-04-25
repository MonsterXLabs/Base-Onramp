import { UserDTO, UserDTOConverter } from '@/dto/user.dto';
import { UserModel } from '@/entities/user.entity';
import { connectMongoose } from '@/modules/mongodb.module';
import { Types } from 'mongoose';
import { Service } from 'typedi';

@Service()
export class UserService {
  async getUserByQuery(query): Promise<UserDTO | null> {
    await connectMongoose();
    const user = await UserModel.findOne(query);

    if (!user) {
      return null;
    }

    const userDto = UserDTOConverter.convertFromEntity(user.toObject());
    return userDto;
  }

  async getUserById(id: string): Promise<UserDTO | null> {
    return this.getUserByQuery({ _id: new Types.ObjectId(id) });
  }
}
