import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './lib/mongodb.js';
import Loan from './models/Loan.js';

dotenv.config();

async function clearLoans() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    
    console.log('Clearing Loans collection...');
    const result = await Loan.deleteMany({});
    
    console.log(`Successfully deleted ${result.deletedCount} loans.`);
    process.exit(0);
  } catch (error) {
    console.error('Error clearing loans:', error);
    process.exit(1);
  }
}

clearLoans();
