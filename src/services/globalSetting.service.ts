import { GlobalSettingModel } from '@/entities/globalSetting.entity';
import { connectMongoose } from '@/modules/mongodb.module';
import { Service } from 'typedi';

@Service()
export class GlobalSettingService {
  async getGlobalSettingByKey(key: string) {
    await connectMongoose();
    const setting = await GlobalSettingModel.findOne({ key }).exec();

    if (!setting) return null;

    const { value } = setting.toObject();

    return value;
  }
}
