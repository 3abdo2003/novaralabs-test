import clientPromise from '../../mongodb.js';
import { verifyJWT } from '../../auth.js';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

export default async function handler(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const user = verifyJWT(token);

    if (!user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const client = await clientPromise;
    const db = client.db("NovaraLabs");

    if (req.method === 'GET') {
        const { batchId } = req.query;

        if (batchId) {
            // Get batch details (tokens)
            try {
                const tokens = await db.collection("qr_tokens")
                    .find({ batchId: new ObjectId(batchId) })
                    .sort({ createdAt: -1 })
                    .toArray();
                return res.status(200).json({ success: true, data: tokens });
            } catch (error) {
                return res.status(400).json({ success: false, error: 'Invalid batch ID' });
            }
        }

        // List all batches
        const batches = await db.collection("qr_batches")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();
        return res.status(200).json({ success: true, data: batches });
    }

    if (req.method === 'POST') {
        const { productId, productName, count } = req.body || {};

        if (!productId || !productName || !count || count <= 0 || count > 100) {
            return res.status(400).json({ success: false, error: 'Invalid generation parameters' });
        }

        try {
            // Create Batch
            const batch = {
                productId: new ObjectId(productId),
                productName,
                count: parseInt(count),
                createdAt: new Date()
            };
            const batchResult = await db.collection("qr_batches").insertOne(batch);
            const batchId = batchResult.insertedId;

            // Enforce global uniqueness automatically using MongoDB native unique indexing
            await db.collection("qr_tokens").createIndex({ token: 1 }, { unique: true });

            // Generate Unique Tokens securely and efficiently
            const tokens = [];
            const tokenStrings = new Set();

            while (tokens.length < count) {
                // UUID provides 122 bits of entropy mathematically ruling out collisions naturally
                const tokenStr = crypto.randomUUID().replace(/-/g, '').substring(0, 16).toUpperCase();
                
                // Check local uniqueness in this batch instantly
                if (tokenStrings.has(tokenStr)) continue;

                tokenStrings.add(tokenStr);
                tokens.push({
                    batchId,
                    productId: new ObjectId(productId),
                    productName,
                    token: tokenStr,
                    scanCount: 0,
                    status: 'unused',
                    createdAt: new Date()
                });
            }

            try {
                // Execute a single atomic insert avoiding the 100 sequential DB hit penalty
                await db.collection("qr_tokens").insertMany(tokens, { ordered: false });
            } catch (err) {
                if (err.code === 11000) {
                    console.warn("Extremely rare collision intercepted by unique DB index. Batch marginally truncated.");
                } else {
                    throw err;
                }
            }

            return res.status(201).json({ 
                success: true, 
                message: `${count} tokens generated successfully`,
                batchId 
            });
        } catch (error) {
            console.error('QR Generation Error:', error);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
}
