import clientPromise from './utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db("NovaraLabs");
    const products = await db.collection("inventoryitems").find({}).toArray();
    
    return res.status(200).json({ success: true, data: products });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
}
