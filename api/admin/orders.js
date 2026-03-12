import clientPromise from '../utils/db.js';
import { ObjectId } from 'mongodb';
import { sendStatusEmail } from '../utils/email.js';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("NovaraLabs");
  const collection = db.collection("orders");

  switch (req.method) {
    case 'GET':
      try {
        const { skip = 0, limit = 10, status, region, startDate, endDate } = req.query;
        
        const query = {};
        if (region) query.region = region;
        if (status) query.status = status;
        if (startDate || endDate) {
          query.createdAt = {};
          if (startDate) query.createdAt.$gte = new Date(startDate);
          if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const totalOrders = await collection.countDocuments(query);
        const orders = await collection.find(query)
          .sort({ createdAt: -1 })
          .skip(parseInt(skip))
          .limit(parseInt(limit))
          .toArray();

        return res.status(200).json({ 
          success: true, 
          data: orders,
          totalOrders,
          hasMore: parseInt(skip) + orders.length < totalOrders
        });
      } catch (e) {
        return res.status(500).json({ success: false, error: e.message });
      }

    case 'PUT':
      try {
        const { _id, ...updateData } = req.body;
        if (!_id) return res.status(400).json({ success: false, error: 'ID is required' });
        
        const result = await collection.updateOne(
          { _id: new ObjectId(_id) },
          { $set: updateData }
        );

        // If status was updated, send notification email
        if (updateData.status) {
          const order = await collection.findOne({ _id: new ObjectId(_id) });
          if (order) {
            await sendStatusEmail(order, updateData.status);
          }
        }

        return res.status(200).json({ success: true, result });
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
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
