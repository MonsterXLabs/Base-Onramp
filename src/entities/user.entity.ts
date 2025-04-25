import { Schema, model, models, Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  username: string;
  wallet: string;
  avatar: {
    public_id: string;
    url: string;
  };
  banner: {
    public_id: string;
    url: string;
  };
  userType: number;
  phoneNumber: string;
  email: string;
  bio: string;
  instagram: string;
  facebook: string;
  twitter: string;
  website: string;
  active: boolean;
  isAdmin: boolean;
  isCurator: boolean;
  lies: number;
}

const userSchema = new Schema<IUser>({
  firstName: { type: String, minlength: 2, maxlength: 50 },
  lastName: { type: String, minlength: 2, maxlength: 50 },
  username: { type: String },
  wallet: { type: String },
  avatar: {
    public_id: { type: String },
    url: { type: String },
  },
  banner: {
    public_id: { type: String },
    url: { type: String },
  },
  userType: { type: Number, enum: [1, 2, 3], default: 1 },
  phoneNumber: { type: String },
  email: { type: String, match: /.+\@.+\..+/ },
  bio: { type: String, default: '' },
  instagram: { type: String, default: '' },
  facebook: { type: String, default: '' },
  twitter: { type: String, default: '' },
  website: { type: String, default: '' },
  active: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  isCurator: { type: Boolean, default: false },
  lies: { type: Number, default: 0 },
});

models.User = models.User || model<IUser>('User', userSchema);
export const UserModel = models.User;
