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
let lastDbError = '';

export const getDbError = () => lastDbError;

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
    lastDbError = !uri ? 'MONGODB_URI environment variable is missing.' : 'MONGODB_URI contains placeholder <db_password>.';
    console.warn('\n⚠️ [EventPulse Database Notice]');
    console.warn(lastDbError);
    console.warn('Running with EventPulse High-Performance In-Memory & File Store fallback for seamless operation.\n');
    useMemoryFallback = true;
    return false;
  }

  cachedPromise = (async () => {
    const dbName = process.env.DB_NAME || 'eventpulse';

    const tryConnect = async (connUri: string) => {
      return await mongoose.connect(connUri, {
        dbName,
        serverSelectionTimeoutMS: 6000,
        connectTimeoutMS: 6000,
        maxPoolSize: 10,
      });
    };

    try {
      console.log('Connecting to MongoDB Atlas at:', uri.replace(/:([^:@]+)@/, ':****@'));
      const conn = await tryConnect(uri);
      isConnected = true;
      useMemoryFallback = false;
      lastDbError = '';
      console.log(`✅ MongoDB Connected to: ${conn.connection.host} / ${conn.connection.name || dbName}`);
      return true;
    } catch (error: any) {
      console.error('❌ MongoDB Atlas Connection Error:', error.message);
      lastDbError = error.message;

      // Automatic fallback if DNS SRV lookup failed (e.g. ECONNREFUSED querySrv)
      if (error.message?.includes('querySrv') && uri.includes('cluster0.ji8zsnj.mongodb.net')) {
        try {
          console.log('🔄 Attempting direct replicaSet connection fallback...');
          const directUri = uri.replace(
            'cluster0.ji8zsnj.mongodb.net',
            'ac-nlhpxys-shard-00-00.ji8zsnj.mongodb.net:27017,ac-nlhpxys-shard-00-01.ji8zsnj.mongodb.net:27017,ac-nlhpxys-shard-00-02.ji8zsnj.mongodb.net:27017'
          ).replace('mongodb+srv://', 'mongodb://') + (uri.includes('?') ? '&' : '?') + 'ssl=true&replicaSet=atlas-q5v3nz-shard-0&authSource=admin';

          const conn = await tryConnect(directUri);
          isConnected = true;
          useMemoryFallback = false;
          lastDbError = '';
          console.log(`✅ MongoDB Connected via direct replicaSet: ${conn.connection.host}`);
          return true;
        } catch (directErr: any) {
          lastDbError = directErr.message;
        }
      }

      if (lastDbError.includes('whitelist') || lastDbError.includes('ETIMEDOUT') || lastDbError.includes('ECONNREFUSED')) {
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
