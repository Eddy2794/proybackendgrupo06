import mongoose from 'mongoose';
import config from './index.js';

export const connectDB = async () => {
  await mongoose.connect(config.dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('✅ MongoDB connected');
};