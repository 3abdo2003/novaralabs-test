import clientPromise from '../../lib/mongodb.js';
import { signJWT } from '../../lib/auth.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { username, password } = req.body || {};

    if (!username || !password) {
        return res.status(400).json({ success: false, error: 'Username and password are required' });
    }

    try {
        const client = await clientPromise;
        const db = client.db("NovaraLabs");
        const collection = db.collection("admins");

        const adminCount = await collection.countDocuments();

        if (adminCount === 0) {
            // Bootstrap mode: allow admin/admin123 to create the first account
            if (username === 'admin' && password === 'admin123') {
                const hashedPassword = await bcrypt.hash(password, 10);
                const result = await collection.insertOne({
                    username,
                    password: hashedPassword,
                    name: 'Initial Admin',
                    createdAt: new Date()
                });
                
                const token = signJWT({ id: result.insertedId, username });
                return res.status(201).json({ success: true, token, message: 'Initial admin created successfully' });
            } else {
                return res.status(401).json({ success: false, error: 'Invalid credentials for initial setup' });
            }
        }

        const user = await collection.findOne({ username });

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const token = signJWT({ id: user._id, username: user.username });

        return res.status(200).json({ success: true, token });
    } catch (e) {
        console.error('Login error:', e);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
}
