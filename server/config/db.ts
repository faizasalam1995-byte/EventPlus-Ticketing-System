import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;
let useMemoryFallback = false;

export const connectDB = async (): Promise<boolean> => {
  const uri = process.env.MONGODB_URI || '';

  if (!uri || uri.includes('<db_password>')) {
    console.warn('\n⚠️ [EventPulse Database Notice]');
    console.warn('MongoDB Atlas URI contains placeholder "<db_password>".');
    console.warn('To connect to your Atlas cluster, please replace <db_password> with your actual MongoDB user password in .env.');
    console.warn('Running with EventPulse High-Performance In-Memory & File Store fallback for seamless development & offline evaluation.\n');
    useMemoryFallback = true;
    return false;
  }

  try {
    console.log('Connecting to MongoDB Atlas at:', uri.replace(/:([^:@]+)@/, ':****@'));
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 6000,
      connectTimeoutMS: 6000,
    });
    isConnected = true;
    useMemoryFallback = false;
    console.log(`✅ MongoDB Connected to: ${conn.connection.host} / ${conn.connection.name}`);
    return true;
  } catch (error: any) {
    console.error('❌ MongoDB Atlas Connection Error:', error.message);
    console.warn('⚠️ Switching to EventPulse Resilient Store fallback so application remains 100% operational!\n');
    useMemoryFallback = true;
    return false;
  }
};

export const isDbConnected = () => isConnected;
export const isUsingFallback = () => useMemoryFallback;
