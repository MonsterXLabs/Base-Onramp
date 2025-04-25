import { isDev } from '@/lib/contract';
import mongoose from 'mongoose';

const uri = isDev
  ? process.env.TEST_MONGODB_URI
  : process.env.LIVE_MONGODB_URI || '';

if (!uri) {
  throw new Error('Please add your Mongo URI to .env');
}

const mongooseOptions = {};

export const connectMongoose = async (): Promise<typeof mongoose> => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri, mongooseOptions);
  }
  return mongoose;
};
