import { Schema, model, models, Document } from 'mongoose';

export interface IGlobalSetting extends Document {
  key: string;
  value: any;
}

const globalSettingSchema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: Schema.Types.Mixed,
    required: true,
  },
});

models.GlobalSettingModel =
  models.GlobalSettingModel ||
  model<IGlobalSetting>('GlobalSetting', globalSettingSchema);

export const GlobalSettingModel = models.GlobalSettingModel;
