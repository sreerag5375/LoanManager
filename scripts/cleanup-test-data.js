import mongoose from 'mongoose';
import Loan from '../models/Loan.js';

async function cleanup() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not set in environment.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { dbName: 'loan-manager' });
    console.log('Connected to MongoDB (loan-manager)');

    const result = await Loan.deleteMany({ name: 'History Test' });
    console.log(`Deleted ${result.deletedCount} loans named "History Test"`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
}

cleanup();
