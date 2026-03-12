import clientPromise from '../utils/db.js';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("NovaraLabs");
  const collection = db.collection("inventoryitems");

  switch (req.method) {
    case 'GET':
      try {
        const items = await collection.find({}).toArray();
        return res.status(200).json({ success: true, data: items });
      } catch (e) {
        return res.status(500).json({ success: false, error: e.message });
      }

    case 'POST':
      try {
        let newItem = req.body;
        
        // Save base64 image to public folder if present
        if (newItem.image && newItem.image.startsWith('data:image')) {
            try {
                const base64Data = newItem.image.replace(/^data:image\/\w+;base64,/, "");
                const extMatch = newItem.image.match(/^data:image\/(\w+);base64,/);
                const ext = extMatch ? extMatch[1] : 'png';
                const filename = `${newItem.slug || 'product'}.${ext}`;
                const publicProductsPath = path.join(process.cwd(), 'public', 'products');
                
                if (!fs.existsSync(publicProductsPath)) {
                    fs.mkdirSync(publicProductsPath, { recursive: true });
                }
                
                const filePath = path.join(publicProductsPath, filename);
                fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
                
                // Keep the base64 in the DB, but now we also have physical replica
            } catch (err) {
                console.error("Failed to save image to public directory:", err);
            }
        }

        const result = await collection.insertOne(newItem);
        return res.status(201).json({ success: true, data: { ...newItem, _id: result.insertedId } });
      } catch (e) {
        return res.status(500).json({ success: false, error: e.message });
      }

    case 'PUT':
      try {
        let { _id, ...updateData } = req.body;
        if (!_id) return res.status(400).json({ success: false, error: 'ID is required' });
        
        // Save base64 image to public folder if updated
        if (updateData.image && updateData.image.startsWith('data:image')) {
            try {
                const base64Data = updateData.image.replace(/^data:image\/\w+;base64,/, "");
                const extMatch = updateData.image.match(/^data:image\/(\w+);base64,/);
                const ext = extMatch ? extMatch[1] : 'png';
                const filename = `${updateData.slug || 'product'}.${ext}`;
                const publicProductsPath = path.join(process.cwd(), 'public', 'products');
                
                if (!fs.existsSync(publicProductsPath)) {
                    fs.mkdirSync(publicProductsPath, { recursive: true });
                }
                
                const filePath = path.join(publicProductsPath, filename);
                fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
            } catch (err) {
                console.error("Failed to save image to public directory:", err);
            }
        }

        const result = await collection.updateOne(
          { _id: new ObjectId(_id) },
          { $set: updateData }
        );
        return res.status(200).json({ success: true, result });
      } catch (e) {
        return res.status(500).json({ success: false, error: e.message });
      }

    case 'DELETE':
      try {
        const { id } = req.query;
        if (!id) return res.status(400).json({ success: false, error: 'ID is required' });
        
        const itemToDelete = await collection.findOne({ _id: new ObjectId(id) });
        if (itemToDelete && itemToDelete.slug) {
            const publicProductsPath = path.join(process.cwd(), 'public', 'products');
            
            // Try to delete common extensions
            const possibleExts = ['png', 'jpg', 'jpeg', 'webp'];
            for (const ext of possibleExts) {
                const filePath = path.join(publicProductsPath, `${itemToDelete.slug}.${ext}`);
                if (fs.existsSync(filePath)) {
                    try {
                        fs.unlinkSync(filePath);
                    } catch (err) {
                        console.error("Failed to delete physical image file:", err);
                    }
                }
            }
        }

        await collection.deleteOne({ _id: new ObjectId(id) });
        return res.status(200).json({ success: true });
      } catch (e) {
        return res.status(500).json({ success: false, error: e.message });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
