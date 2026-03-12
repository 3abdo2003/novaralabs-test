import clientPromise from '../../lib/mongodb.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { slug, size, quantity } = req.body;

  if (!slug || quantity === undefined) {
    return res.status(400).json({ success: false, error: 'Missing required parameters' });
  }

  try {
    const client = await clientPromise;
    const db = client.db("NovaraLabs");

    const item = await db.collection("inventoryitems").findOne({ slug });
    
    if (!item) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    let availableStock = 0;

    if (size && item.sizesEG && item.sizesEG.length > 0) {
      const variant = item.sizesEG.find(v => v.size === size);
      availableStock = variant ? (variant.stock || 0) : 0;
    } else {
      availableStock = item.stock || 0;
    }

    if (availableStock === 0) {
      return res.status(400).json({ success: false, error: 'OUT_OF_STOCK', availableStock });
    }

    // Backend implicitly clamps the requested quantity
    const clampedQuantity = Math.max(1, Math.min(quantity, availableStock));

    return res.status(200).json({ success: true, quantity: clampedQuantity, availableStock });
  } catch (err) {
    console.error('Update Cart Quantity Error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
