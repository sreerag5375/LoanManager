import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGO_URI;

const opts = {
  family: 4,
  serverSelectionTimeoutMS: 5000,
};

console.log('Connecting to:', MONGODB_URI);

mongoose.connect(MONGODB_URI, opts)
  .then(() => {
    console.log('SUCCESS: Connected to MongoDB');
    process.exit(0);
  })
  .catch((err) => {
    console.error('FAILURE: Connection error:');
    console.error(err.message);
    process.exit(1);
  });
