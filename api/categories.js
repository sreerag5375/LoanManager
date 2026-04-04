import connectDB from '../lib/mongodb.js';
import Category from '../models/Category.js';
import Transaction from '../models/Transaction.js';

export default async function handler(req, res) {
  const { method } = req;

  try {
    await connectDB();
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Database connection failed: ' + error.message });
  }

  switch (method) {
    case 'GET':
      try {
        const { type } = req.query;
        const query = type ? { type } : {};
        const categories = await Category.find(query).sort({ name: 1 });
        res.status(200).json({ success: true, data: categories });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      try {
        const category = await Category.create(req.body);
        res.status(201).json({ success: true, data: category });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'PUT':
      try {
        const { id } = req.query;
        const { name } = req.body;
        if (!id || !name) return res.status(400).json({ success: false, error: 'ID and Name required' });
        
        const oldCategory = await Category.findById(id);
        if (!oldCategory) return res.status(404).json({ success: false, error: 'Category not found' });
        
        const oldName = oldCategory.name;
        const type = oldCategory.type;
        
        const updatedCategory = await Category.findByIdAndUpdate(id, { name }, { new: true });
        
        // Update all transactions that were using the old category name
        await Transaction.updateMany({ category: oldName, type: type }, { category: name });
        
        res.status(200).json({ success: true, data: updatedCategory });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
