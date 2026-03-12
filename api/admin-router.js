import analytics from '../lib/api/admin/analytics.js';
import inventory from '../lib/api/admin/inventory.js';
import login from '../lib/api/admin/login.js';
import orders from '../lib/api/admin/orders.js';
import promoCodes from '../lib/api/admin/promo-codes.js';
import users from '../lib/api/admin/users.js';
import qrcodes from '../lib/api/admin/qrcodes.js';

export default async function handler(req, res) {
    // Vercel rewrites or direct calls might have different URL formats
    // We want to extract the part after /api/admin/
    const url = req.url.split('?')[0];
    const parts = url.split('/');
    const adminIndex = parts.indexOf('admin');
    const action = parts[adminIndex + 1];

    switch (action) {
        case 'analytics': return analytics(req, res);
        case 'inventory': return inventory(req, res);
        case 'login': return login(req, res);
        case 'orders': return orders(req, res);
        case 'promo-codes': return promoCodes(req, res);
        case 'users': return users(req, res);
        case 'qrcodes': return qrcodes(req, res);
        default: 
            return res.status(404).json({ 
                success: false, 
                error: `Admin route not found: ${action}`,
                debug: { url, action }
            });
    }
}
