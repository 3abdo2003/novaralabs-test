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
            // Status remains verified, but we record it's the second use
            updateData.$set.status = 'verified'; 
        } else {
            // Already 2 or more scans - Mark as expired if not already
            if (qrCode.status !== 'expired') {
                await collection.updateOne({ _id: qrCode._id }, { $set: { status: 'expired' } });
            }
            return res.status(200).json({ 
                success: true, 
                status: 'expired', 
                productName: qrCode.productName,
                scanCount: qrCode.scanCount
            });
        }

        await collection.updateOne({ _id: qrCode._id }, updateData);

        return res.status(200).json({
            success: true,
            status: 'verified',
            productName: qrCode.productName,
            scanCount: qrCode.scanCount + 1
        });

    } catch (error) {
        console.error('Verification Error:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
}
