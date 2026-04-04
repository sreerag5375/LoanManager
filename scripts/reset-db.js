import mongoose from 'mongoose';

import connectDB from '../lib/mongodb.js';
import Loan from '../models/Loan.js';
import Category from '../models/Category.js';
import Transaction from '../models/Transaction.js';



async function resetDB() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    
    console.log('Clearing Loans collection...');
    const loanResult = await Loan.deleteMany({});
    console.log(`Successfully deleted ${loanResult.deletedCount} loans.`);

    console.log('Clearing Categories collection...');
    const catResult = await Category.deleteMany({});
    console.log(`Successfully deleted ${catResult.deletedCount} categories.`);

    console.log('Clearing Transactions collection...');
    const transResult = await Transaction.deleteMany({});
    console.log(`Successfully deleted ${transResult.deletedCount} transactions.`);
    
    console.log('Database reset complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

resetDB();
