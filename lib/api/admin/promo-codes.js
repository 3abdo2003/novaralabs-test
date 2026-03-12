import clientPromise from '../../mongodb.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("NovaraLabs");
  const collection = db.collection("promocodes");
  
  // One-time cleanup: Drop the problematic index if it exists
  try {
    await collection.dropIndex("codeName_1");
  } catch (e) {
    // Index might not exist, that's fine
  }


  switch (req.method) {
    case 'GET':
      try {
        const codes = await collection.find({}).toArray();
        return res.status(200).json({ success: true, data: codes });
      } catch (e) {
        return res.status(500).json({ success: false, error: e.message });
      }

    case 'POST':
      try {
        const { code, discount, expiry } = req.body;
        if (!code) return res.status(400).json({ success: false, error: 'Code is required' });
        
        const newItem = {
          code: code.toUpperCase(),
          discount: Number(discount),
          expiry: expiry ? new Date(expiry) : null,
          isActive: true,
          createdAt: new Date()
        };
        
        const result = await collection.insertOne(newItem);

        return res.status(201).json({ success: true, data: { ...newItem, _id: result.insertedId } });
      } catch (e) {
        return res.status(500).json({ success: false, error: e.message });
      }

    case 'PATCH':
      try {
        const { id, isActive } = req.body;
        if (!id) return res.status(400).json({ success: false, error: 'ID is required' });
        
        await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { isActive: !!isActive } }
        );
        return res.status(200).json({ success: true });
      } catch (e) {
        return res.status(500).json({ success: false, error: e.message });
      }

    case 'DELETE':
      try {
        const { id } = req.query;
        if (!id) return res.status(400).json({ success: false, error: 'ID is required' });
        
        await collection.deleteOne({ _id: new ObjectId(id) });
        return res.status(200).json({ success: true });
      } catch (e) {
        return res.status(500).json({ success: false, error: e.message });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
