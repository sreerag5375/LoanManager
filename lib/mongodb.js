import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGO_URI environment variable inside .env'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000, // Increased to 30s for better reliability
      connectTimeoutMS: 30000,         // Increased to 30s for initial handshake
      socketTimeoutMS: 45000,
      family: 0,                       // Auto IPv4/v6 selection (resolves some SRV issues)
      maxPoolSize: 10,
      dbName: 'loan-manager',
      tls: true,
      directConnection: false,
      retryWrites: true,              // retry writes on flaky connections
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('--- DB CONNECTION SUCCESS ---');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB Connection Error:', e.message);
    if (e.message.includes('selection timed out')) {
      throw new Error(
        'MongoDB Connection Timeout: Please ensure your current IP address is whitelisted in MongoDB Atlas (Network Access).'
      );
    }
    throw e;
  }

  return cached.conn;
}

export default connectDB;
// mongo db implentation
