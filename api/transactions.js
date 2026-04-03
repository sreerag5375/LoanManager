import connectDB from '../lib/mongodb.js';
import Transaction from '../models/Transaction.js';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  await connectDB();

  switch (method) {
    case 'GET':
      try {
        const transactions = await Transaction.find({}).sort({ date: -1 });
        res.status(200).json({ success: true, data: transactions });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      try {
        const transaction = await Transaction.create(req.body);
        res.status(201).json({ success: true, data: transaction });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'PUT':
      try {
        if (!id) return res.status(400).json({ success: false, error: 'ID required' });
        const transaction = await Transaction.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!transaction) return res.status(404).json({ success: false, error: 'Not found' });
        res.status(200).json({ success: true, data: transaction });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'DELETE':
      try {
        if (!id) return res.status(400).json({ success: false, error: 'ID required' });
        const deleted = await Transaction.deleteOne({ _id: id });
        if (!deleted.deletedCount) return res.status(404).json({ success: false, error: 'Not found' });
        res.status(200).json({ success: true, data: {} });
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
