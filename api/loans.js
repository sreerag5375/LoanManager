import connectDB from '../lib/mongodb.js';
import Loan from '../models/Loan.js';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query; // Used for PUT and DELETE (?id=...)

  try {
    await connectDB();
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Database connection failed: ' + error.message });
  }

  switch (method) {
    case 'GET':
      try {
        if (id) {
          const loan = await Loan.findById(id);
          if (!loan) return res.status(404).json({ success: false, error: 'Loan not found' });
          return res.status(200).json({ success: true, data: loan });
        }
        const loans = await Loan.find({}).sort({ amount: 1 });
        res.status(200).json({ success: true, data: loans });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      try {
        const loan = await Loan.create(req.body);
        res.status(201).json({ success: true, data: loan });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'PUT':
      try {
        if (!id) return res.status(400).json({ success: false, error: 'ID is required to update a loan' });
        const loan = await Loan.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!loan) return res.status(404).json({ success: false, error: 'Loan not found' });
        res.status(200).json({ success: true, data: loan });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'DELETE':
      try {
        if (!id) return res.status(400).json({ success: false, error: 'ID is required to close a loan' });
        const loan = await Loan.findByIdAndUpdate(id, { status: 'closed' }, { new: true });
        if (!loan) return res.status(404).json({ success: false, error: 'Loan not found' });
        res.status(200).json({ success: true, data: loan });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
