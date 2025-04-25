import { Service } from 'typedi';
import { RampModel, IRamp } from '@/entities/ramp.entity';
import { RampDTO, rampDtoSchema } from '@/dto/ramp.dto';
import { connectMongoose } from '../modules/mongodb.module';
import { Types } from 'mongoose';

@Service()
export class RampService {
  async createRamp(rampDto: RampDTO): Promise<RampDTO> {
    await connectMongoose();
    // Validate entity
    rampDtoSchema.parse(rampDto);

    const rampEntity: IRamp = {
      ...rampDto,
      _id: new Types.ObjectId(),
      nftId: new Types.ObjectId(rampDto.nftId),
    } as IRamp;

    // Insert entity into the database
    const ramp = new RampModel(rampEntity);
    await ramp.save();

    // Convert entity back to DTO
    return RampDTO.fromEntity(ramp.toObject());
  }

  async getRampByQuery(query): Promise<RampDTO | null> {
    await connectMongoose();
    const ramp = await RampModel.findOne(query).exec();

    if (!ramp) {
      return null;
    }

    // Convert entity to DTO
    return RampDTO.fromEntity(ramp.toObject());
  }

  async updateRamp(
    id: string,
    rampDto: Partial<RampDTO>,
  ): Promise<RampDTO | null> {
    await connectMongoose();
    // Validate update data
    rampDtoSchema.partial().parse(rampDto);
    const updateData: Partial<IRamp> = {
      ...rampDto,
      ...(rampDto.nftId && { nftId: new Types.ObjectId(rampDto.nftId) }),
    };

    console.log(updateData);
    const ramp = await RampModel.findByIdAndUpdate(id, updateData, {
      new: true,
    }).exec();

    if (!ramp) {
      return null;
    }

    // Convert entity to DTO
    return RampDTO.fromEntity(ramp.toObject());
  }
  async deleteRamp(id: string): Promise<boolean> {
    await connectMongoose();
    const result = await RampModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
