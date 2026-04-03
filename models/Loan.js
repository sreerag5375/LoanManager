import mongoose from 'mongoose';

const LoanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for the loan.'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount for the loan.'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active',
  },
});

export default mongoose.models.Loan || mongoose.model('Loan', LoanSchema);
