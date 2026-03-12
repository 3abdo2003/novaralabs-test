import clientPromise from '../lib/mongodb.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { token } = req.body || {};

    if (!token) {
        return res.status(400).json({ success: false, error: 'Token is required' });
    }

    try {
        const client = await clientPromise;
        const db = client.db("NovaraLabs");
        const collection = db.collection("qr_tokens");

        const qrCode = await collection.findOne({ token: token.toUpperCase() });

        if (!qrCode) {
            return res.status(404).json({ success: false, status: 'invalid', message: 'QR Code Invalid: This code does not exist in our database.' });
        }

        const now = new Date();
        const updateData = {
            $set: { lastScanAt: now },
            $inc: { scanCount: 1 }
        };

        if (qrCode.scanCount === 0) {
            updateData.$set.firstScanAt = now;
            updateData.$set.status = 'verified';
        } else if (qrCode.scanCount === 1) {
            updateData.$set.status = 'expired';
        } else {
            // Already 2 or more scans
            return res.status(200).json({ 
                success: true, 
                status: 'expired', 
                message: 'QR Code Invalid: This code has already been used multiple times.',
                productName: qrCode.productName,
                scanCount: qrCode.scanCount
            });
        }

        await collection.updateOne({ _id: qrCode._id }, updateData);

        return res.status(200).json({
            success: true,
            status: qrCode.scanCount === 0 ? 'verified' : 'expired',
            productName: qrCode.productName,
            scanCount: qrCode.scanCount + 1,
            message: 'Product Verified: This product is authentic.'
        });

    } catch (error) {
        console.error('Verification Error:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
}
