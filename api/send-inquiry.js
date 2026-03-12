import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { product, name, email, phone, message } = req.body || {};

    if (!name || !email || !message || !product || !product.name) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const {
        SMTP_HOST,
        SMTP_PORT,
        SMTP_SECURE,
        SMTP_USER,
        SMTP_PASS,
        FROM_EMAIL,
        TO_EMAIL,
    } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
        return res.status(500).json({ success: false, error: 'Email transport is not configured on the server.' });
    }

    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT) || 587,
        secure: SMTP_SECURE === 'true',
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });

    const toAddress = TO_EMAIL || 'support@novaralabs.eu';
    const fromAddress = FROM_EMAIL || SMTP_USER;

    const logoUrl = 'https://novaralabs.eu/logo.png';
    const supportSubject = `Product Inquiry: ${product.name} — ${name}`;
    const customerSubject = `We've received your inquiry: ${product.name}`;

    const commonStyle = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f4f4f5; }
        .wrapper { background-color: #f4f4f5; padding: 40px 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .header { background: #ffffff; padding: 40px; color: #18181b; text-align: center; border-bottom: 1px solid #f4f4f5; }
        .logo { margin-bottom: 24px; }
        .logo img { height: 60px; }
        .title { font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; margin: 0; color: #18181b; }
        
        .content { padding: 40px; }
        .section { margin-bottom: 32px; }
        .section-title { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; color: #a1a1aa; margin-bottom: 16px; border-bottom: 1px solid #f4f4f5; padding-bottom: 8px; }
        
        .detail-row { margin-bottom: 12px; display: flex; font-size: 14px; }
        .detail-label { font-weight: 700; color: #71717a; width: 100px; flex-shrink: 0; }
        .detail-value { color: #18181b; }
        
        .message-box { background: #fafafa; border-radius: 16px; padding: 24px; font-size: 15px; color: #27272a; border: 1px solid #f4f4f5; line-height: 1.8; }
        
        .product-card { background: #18181b; color: white; border-radius: 16px; padding: 24px; display: flex; align-items: center; gap: 20px; text-decoration: none; margin-bottom: 32px; }
        .product-info h3 { margin: 0; font-size: 16px; font-weight: 900; }
        .product-info p { margin: 4px 0 0; font-size: 12px; color: #a1a1aa; }

        .footer { padding: 40px; text-align: center; border-top: 1px solid #f4f4f5; }
        .footer-text { font-size: 12px; color: #a1a1aa; margin-bottom: 8px; }
        .footer-link { color: #18181b; text-decoration: none; font-weight: 700; }
    </style>
    `;

    const supportHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8">${commonStyle}</head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <div class="logo"><img src="${logoUrl}" alt="Novara Labs"></div>
                    <div class="title">Product Inquiry</div>
                </div>
                <div class="content">
                    <div class="section">
                        <div class="section-title">Inquiry Target</div>
                        <a href="https://novaralabs.eu/peptides/${product.slug}" class="product-card">
                            <div class="product-info">
                                <h3>${product.name}</h3>
                                <p>${product.series} &bull; ${product.price || 'Contact for Price'}${product.shortDescription ? ` &bull; ${product.shortDescription}` : ''}</p>
                            </div>
                        </a>
                    </div>
                    <div class="section">
                        <div class="section-title">Customer Intelligence</div>
                        <div class="detail-row"><span class="detail-label">Name</span><span class="detail-value">${name}</span></div>
                        <div class="detail-row"><span class="detail-label">Email</span><span class="detail-value">${email}</span></div>
                        ${phone ? `<div class="detail-row"><span class="detail-label">Phone</span><span class="detail-value">${phone}</span></div>` : ''}
                    </div>
                    <div class="section">
                        <div class="section-title">Message Content</div>
                        <div class="message-box">${message}</div>
                    </div>
                </div>
                <div class="footer">
                    <div class="footer-text">Novara Labs — Lead Generation System</div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    const customerHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8">${commonStyle}</head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <div class="logo"><img src="${logoUrl}" alt="Novara Labs"></div>
                    <div class="title">Inquiry Received</div>
                </div>
                <div class="content">
                    <p style="font-size: 16px; font-weight: 700; margin-top: 0;">Hi ${name.split(' ')[0]},</p>
                    <p style="font-size: 14px; color: #71717a; margin-bottom: 32px;">Thank you for your interest in our high-performance research compounds. We've received your inquiry regarding <strong>${product.name}</strong>. A technical specialist will review your request and contact you shortly with the information you need.</p>
                    
                    <div class="section">
                        <div class="section-title">Your Inquiry Details</div>
                        <div class="detail-row"><span class="detail-label">Product</span><span class="detail-value">${product.name}</span></div>
                        <div class="detail-row"><span class="detail-label">Series</span><span class="detail-value">${product.series}</span></div>
                    </div>

                    <div style="background: #fafafa; border-left: 4px solid #18181b; padding: 20px; border-radius: 0 12px 12px 0;">
                        <p style="margin: 0; font-size: 13px; font-style: italic; color: #52525b;">"${message}"</p>
                    </div>
                </div>
                <div class="footer">
                    <div class="footer-text">Novara Labs — Precision Bioscience</div>
                    <div class="footer-text">
                        <a href="https://novaralabs.eu" class="footer-link">novaralabs.eu</a>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        // Send to support
        await transporter.sendMail({
            from: `Novara Labs <${fromAddress}>`,
            to: toAddress,
            replyTo: email,
            subject: supportSubject,
            html: supportHtml,
            text: `Product Inquiry: ${product.name}\n\nCustomer: ${name} (${email})\nMessage: ${message}`,
        });

        // Send confirmation to customer
        await transporter.sendMail({
            from: `Novara Labs <${fromAddress}>`,
            to: email,
            replyTo: toAddress,
            subject: customerSubject,
            html: customerHtml,
            text: `Hi ${name}, we've received your inquiry about ${product.name} and will contact you soon.`,
        });

        return res.json({ success: true });
    } catch (err) {
        console.error('Error sending inquiry email:', err);
        return res.status(500).json({ success: false, error: 'Failed to send email' });
    }
}
