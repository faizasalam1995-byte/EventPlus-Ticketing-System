import dns from 'node:dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Ensure Google & Cloudflare DNS servers are used to prevent querySrv issues on local/cloud networks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore in restricted environments
}

let isConnected = false;
let useMemoryFallback = false;
let cachedPromise: Promise<boolean> | null = null;

export const connectDB = async (): Promise<boolean> => {
  // Reuse existing connection in serverless warm starts
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    useMemoryFallback = false;
    return true;
  }

  // Prevent multiple concurrent connection attempts
  if (cachedPromise) {
    return cachedPromise;
  }

  const uri = process.env.MONGODB_URI || '';

  if (!uri || uri.includes('<db_password>')) {
    console.warn('\n⚠️ [EventPulse Database Notice]');
    console.warn('MongoDB Atlas URI contains placeholder "<db_password>" or is missing.');
    console.warn('To connect to your Atlas cluster, please ensure MONGODB_URI is set in your environment / Vercel Settings.');
    console.warn('Running with EventPulse High-Performance In-Memory & File Store fallback for seamless operation.\n');
    useMemoryFallback = true;
    return false;
  }

  cachedPromise = (async () => {
    try {
      console.log('Connecting to MongoDB Atlas at:', uri.replace(/:([^:@]+)@/, ':****@'));
      const dbName = process.env.DB_NAME || 'eventpulse';
      const conn = await mongoose.connect(uri, {
        dbName,
        serverSelectionTimeoutMS: 6000,
        connectTimeoutMS: 6000,
        maxPoolSize: 10,
      });
      isConnected = true;
      useMemoryFallback = false;
      console.log(`✅ MongoDB Connected to: ${conn.connection.host} / ${conn.connection.name || dbName}`);
      return true;
    } catch (error: any) {
      console.error('❌ MongoDB Atlas Connection Error:', error.message);
      if (error.message?.includes('whitelist') || error.message?.includes('ETIMEDOUT') || error.message?.includes('ECONNREFUSED')) {
        console.warn('💡 Tip: Ensure IP "0.0.0.0/0" is added to your MongoDB Atlas Network Access IP Access List.');
      }
      console.warn('⚠️ Switching to EventPulse Resilient Store fallback so application remains 100% operational!\n');
      useMemoryFallback = true;
      isConnected = false;
      return false;
    } finally {
      cachedPromise = null;
    }
  })();

  return cachedPromise;
};

export const isDbConnected = () => mongoose.connection.readyState === 1 || isConnected;
export const isUsingFallback = () => useMemoryFallback;
