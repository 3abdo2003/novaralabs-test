import clientPromise from '../../lib/mongodb.js';
import { verifyJWT } from '../../lib/auth.js';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyJWT(token);

    if (!decoded) {
        return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
    }

    const client = await clientPromise;
    const db = client.db("NovaraLabs");
    const collection = db.collection("admins");

    switch (req.method) {
        case 'GET':
            try {
                const users = await collection.find({}, { projection: { password: 0 } }).toArray();
                return res.status(200).json({ success: true, data: users });
            } catch (e) {
                return res.status(500).json({ success: false, error: e.message });
            }

        case 'POST':
            try {
                const { username, password, name } = req.body;
                if (!username || !password || !name) {
                    return res.status(400).json({ success: false, error: 'Missing required fields' });
                }

                const existingUser = await collection.findOne({ username });
                if (existingUser) {
                    return res.status(400).json({ success: false, error: 'Username already exists' });
                }

                const hashedPassword = await bcrypt.hash(password, 10);
                const result = await collection.insertOne({
                    username,
                    password: hashedPassword,
                    name,
                    createdAt: new Date()
                });

                return res.status(201).json({ success: true, data: { _id: result.insertedId, username, name } });
            } catch (e) {
                return res.status(500).json({ success: false, error: e.message });
            }

        case 'PUT':
            try {
                const { id, password } = req.body;
                if (!id || !password) {
                    return res.status(400).json({ success: false, error: 'ID and new password are required' });
                }

                const hashedPassword = await bcrypt.hash(password, 10);
                await collection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { password: hashedPassword } }
                );

                return res.status(200).json({ success: true, message: 'Password updated' });
            } catch (e) {
                return res.status(500).json({ success: false, error: e.message });
            }

        case 'DELETE':
            try {
                const { id } = req.query;
                if (!id) {
                    return res.status(400).json({ success: false, error: 'ID is required' });
                }

                if (id === decoded.id) {
                    return res.status(400).json({ success: false, error: 'Safety Check: You cannot delete your own account while logged in.' });
                }

                const result = await collection.deleteOne({ _id: new ObjectId(id) });
                if (result.deletedCount === 0) {
                    return res.status(404).json({ success: false, error: 'User not found' });
                }

                return res.status(200).json({ success: true, message: 'User deleted' });
            } catch (e) {
                return res.status(500).json({ success: false, error: e.message });
            }

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
