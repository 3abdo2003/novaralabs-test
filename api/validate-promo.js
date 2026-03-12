import clientPromise from './utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, error: 'Promo code is required' });
  }

  try {
    const client = await clientPromise;
    const db = client.db("NovaraLabs");
    
    // Find active promo code
    const promo = await db.collection("promocodes").findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    });

    if (!promo) {
      return res.status(404).json({ success: false, error: 'Invalid or expired promo code' });
    }

    // Check if it's expired
    if (promo.expiryDate && new Date(promo.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, error: 'Promo code has expired' });
    }

    return res.json({ 
      success: true, 
      discount: promo.discount,
      type: promo.type || 'PERCENTAGE'
    });

  } catch (err) {
    console.error('Error validating promo code:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
