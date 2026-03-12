import nodemailer from 'nodemailer';
import clientPromise from './utils/db.js';

function safeStr(x) {
  return typeof x === 'string' ? x.trim() : '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const body = req.body || {};
  const region = safeStr(body.region);
  const customer = body.customer || {};
  const shipping = body.shipping || {};
  const payment = body.payment || {};
  const items = Array.isArray(body.items) ? body.items : [];

  const name = safeStr(customer.name);
  const email = safeStr(customer.email);
  const phone = safeStr(customer.phone);

  const address1 = safeStr(shipping.address1);
  const address2 = safeStr(shipping.address2);
  const city = safeStr(shipping.city);
  const governorate = safeStr(shipping.governorate);

  const paymentMethod = safeStr(payment.method);
  const instapayHandle = safeStr(payment.instapayHandle);
  const notes = safeStr(body.notes);

  if (region !== 'EG') {
    return res.status(400).json({ success: false, error: 'Orders are enabled for Egypt only' });
  }

  if (!name || !email || !phone || !address1 || !city || !governorate) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  if (!['INSTAPAY', 'COD'].includes(paymentMethod)) {
    return res.status(400).json({ success: false, error: 'Unsupported payment method' });
  }

  if (paymentMethod === 'INSTAPAY' && !instapayHandle) {
    return res.status(400).json({ success: false, error: 'Instapay handle is required' });
  }

  if (items.length === 0) {
    return res.status(400).json({ success: false, error: 'Cart is empty' });
  }

  const normalizedItems = items
    .map((i) => ({
      slug: safeStr(i.slug),
      name: safeStr(i.name),
      series: safeStr(i.series),
      price: safeStr(i.price),
      size: safeStr(i.selectedSize || i.size),
      quantity: Number.isFinite(Number(i.quantity)) ? Math.max(1, Math.min(99, Math.round(Number(i.quantity)))) : 1,
    }))
    .filter((i) => i.slug && i.name);

  if (normalizedItems.length === 0) {
    return res.status(400).json({ success: false, error: 'Invalid items' });
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

  const supportAddress = TO_EMAIL || 'support@novaralabs.eu';
  const fromAddress = FROM_EMAIL || SMTP_USER;

  const orderId = `EG-${Date.now().toString(36).toUpperCase()}`;

  const itemLines = normalizedItems.map((i) => `- ${i.name} (${i.series}) x${i.quantity} — ${i.price}`).join('\n');
  const shippingLines = [
    address1,
    address2 ? address2 : '',
    `${city}, ${governorate}`,
  ].filter(Boolean).join('\n');

  const paymentLines = [
    `Method: ${paymentMethod}`,
    paymentMethod === 'INSTAPAY' ? `Instapay: ${instapayHandle}` : '',
  ].filter(Boolean).join('\n');

  const promoCode = safeStr(body.promoCode);
  const discount = Number(body.discount) || 0;
  const total = Number(body.total) || 0;
  const subtotal = normalizedItems.reduce((acc, item) => {
    // Extract number from price string (e.g., "1,200 L.E" -> 1200)
    const priceNum = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
    return acc + (priceNum * item.quantity);
  }, 0);

  const supportSubject = `Order Alert: ${orderId} — ${name}`;
  const customerSubject = `Invoice for Order #${orderId} — Novara Labs`;

  const logoUrl = 'https://novaralabs.eu/logo.png';

  const commonStyle = `
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f9f9f9; }
        .container { max-width: 600px; margin: 20px auto; padding: 40px; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #1a1a1a; padding-bottom: 20px; }
        .logo img { height: 40px; width: auto; display: block; }
        .invoice-title { text-align: right; }
        .invoice-title h1 { font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 5px 0; color: #1a1a1a; }
        .invoice-title p { margin: 0; font-size: 12px; color: #666; font-family: monospace; }
        
        .bill-to-section { margin-bottom: 40px; display: flex; justify-content: space-between; }
        .bill-to-block { width: 48%; font-size: 14px; color: #444; }
        .section-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #1a1a1a; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
        
        .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        .invoice-table th { text-align: left; padding: 12px 8px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #666; border-bottom: 1px solid #1a1a1a; }
        .invoice-table th.text-right { text-align: right; }
        .invoice-table th.text-center { text-align: center; }
        
        .invoice-table td { padding: 16px 8px; border-bottom: 1px solid #eee; font-size: 14px; vertical-align: top; }
        .invoice-table td.text-right { text-align: right; }
        .invoice-table td.text-center { text-align: center; }
        
        .item-title { font-weight: 700; color: #1a1a1a; display: block; margin-bottom: 2px; }
        .item-desc { font-size: 12px; color: #666; font-family: monospace; }
        
        .totals-section { width: 50%; float: right; margin-bottom: 40px; }
        .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #444; }
        .total-row.grand-total { border-top: 2px solid #1a1a1a; font-weight: 800; font-size: 18px; color: #1a1a1a; padding-top: 12px; margin-top: 4px; }
        
        .clearfix::after { content: ""; clear: both; display: table; }
        
        .footer { clear: both; margin-top: 40px; font-size: 12px; color: #666; text-align: center; border-top: 1px dotted #ccc; padding-top: 20px; }
        .detail-row { margin-bottom: 4px; }
        .detail-label { font-weight: 600; width: 80px; display: inline-block; }
        .support-box { background: #f9f9f9; padding: 20px; border-radius: 4px; margin-top: 20px; font-size: 13px; text-align: center; }
    </style>
  `;

  const itemsHtml = normalizedItems.map(i => `
    <tr>
        <td>
            <span class="item-title">${i.name}</span>
            <span class="item-desc">Variant: ${i.series}${i.size ? ` — ${i.size}` : ''}</span>
        </td>
        <td class="text-center">${i.quantity}</td>
        <td class="text-right">${i.price}</td>
    </tr>
  `).join('');

  const supportHtml = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8">${commonStyle}</head>
  <body>
      <div class="container">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px;">
              <tr>
                  <td><img src="${logoUrl}" alt="Novara Labs" style="height: 40px;"></td>
                  <td align="right">
                      <h1 style="margin: 0; font-size: 20px; text-transform: uppercase;">New Order</h1>
                      <p style="margin: 4px 0 0 0; font-family: monospace; color: #666;"># ${orderId}</p>
                  </td>
              </tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 30px;">
              <tr>
                  <td width="50%" valign="top">
                      <div class="section-title">Customer Details</div>
                      <div class="detail-row"><span class="detail-label">Name:</span> ${name}</div>
                      <div class="detail-row"><span class="detail-label">Email:</span> ${email}</div>
                      <div class="detail-row"><span class="detail-label">Phone:</span> ${phone}</div>
                  </td>
                  <td width="50%" valign="top" align="right">
                      <div class="section-title" style="text-align: right;">Shipping Information</div>
                      <div style="font-size: 14px; white-space: pre-wrap; color: #444;">${shippingLines}</div>
                  </td>
              </tr>
          </table>

          <div style="margin-bottom: 30px;">
              <div class="section-title">Payment Info</div>
              <div class="detail-row"><span class="detail-label">Method:</span> <strong style="text-transform: uppercase;">${paymentMethod}</strong></div>
              ${paymentMethod === 'INSTAPAY' ? `<div class="detail-row"><span class="detail-label">Handle:</span> ${instapayHandle}</div>` : ''}
              ${notes ? `<div class="detail-row" style="margin-top: 10px;"><span class="detail-label" style="display:block; margin-bottom: 4px;">Notes:</span> <div style="font-size: 14px; background: #f9f9f9; padding: 10px; border-left: 3px solid #ccc;">${notes}</div></div>` : ''}
          </div>

          <table class="invoice-table">
              <thead>
                  <tr>
                      <th>Product Description</th>
                      <th class="text-center" width="20%">Qty</th>
                      <th class="text-right" width="25%">Subtotal</th>
                  </tr>
              </thead>
              <tbody>
                  ${itemsHtml}
              </tbody>
          </table>
          <div class="clearfix">
             <div class="totals-section">
                <div class="total-row">
                    <span>Subtotal</span>
                    <span>EGP ${subtotal.toLocaleString()}</span>
                </div>
                ${promoCode ? `
                <div class="total-row" style="color: #ff6b00;">
                    <span>Discount (${promoCode})</span>
                    <span>- EGP ${discount.toLocaleString()}</span>
                </div>
                ` : ''}
                <div class="total-row grand-total">
                    <span>Total Amount</span>
                    <span>EGP ${total.toLocaleString()}</span>
                </div>
             </div>
          </div>
          <div class="footer">Internal Order Notification &copy; Novara Labs. Middle East Distribution.</div>
      </div>
  </body>
  </html>
  `;

  const customerHtml = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8">${commonStyle}</head>
  <body>
      <div class="container">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px;">
              <tr>
                  <td><img src="${logoUrl}" alt="Novara Labs" style="height: 40px;"></td>
                  <td align="right">
                      <h1 style="margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase;">Invoice</h1>
                      <p style="margin: 4px 0 0 0; font-family: monospace; color: #666;">Date: ${new Date().toLocaleDateString('en-GB')}</p>
                      <p style="margin: 2px 0 0 0; font-family: monospace; color: #666;">Order #: ${orderId}</p>
                  </td>
              </tr>
          </table>

          <p style="font-size: 15px; margin-bottom: 30px;">
              Hi <strong>${name.split(' ')[0]}</strong>,<br/>
              Thank you for your order. This document serves as your official invoice and order confirmation. Our team will contact you shortly to finalize shipping.
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 40px;">
              <tr>
                  <td width="50%" valign="top">
                      <div class="section-title">Billed To</div>
                      <div style="font-size: 14px; color: #444; line-height: 1.5;">
                          <strong>${name}</strong><br/>
                          ${email}<br/>
                          ${phone}
                      </div>
                  </td>
                  <td width="50%" valign="top" align="right">
                      <div class="section-title" style="text-align: right;">Shipped To</div>
                      <div style="font-size: 14px; color: #444; line-height: 1.5; white-space: pre-wrap;">${shippingLines}</div>
                  </td>
              </tr>
          </table>

          <table class="invoice-table">
              <thead>
                  <tr>
                      <th>Product Description</th>
                      <th class="text-center" width="15%">Qty</th>
                      <th class="text-right" width="25%">Subtotal</th>
                  </tr>
              </thead>
              <tbody>
                  ${itemsHtml}
              </tbody>
          </table>

          <div class="clearfix">
             <div class="totals-section">
                <div class="total-row">
                    <span>Subtotal</span>
                    <span>EGP ${subtotal.toLocaleString()}</span>
                </div>
                ${promoCode ? `
                   <div class="total-row" style="color: #ff6b00;">
                       <span>Discount (${promoCode})</span>
                       <span>- EGP ${discount.toLocaleString()}</span>
                   </div>
                ` : ''}
                <div class="total-row grand-total">
                    <span>Total Amount</span>
                    <span>EGP ${total.toLocaleString()}</span>
                </div>
             </div>
          </div>

          <div class="support-box">
             Payment Method: <strong>${paymentMethod}</strong><br/>
             ${paymentMethod === 'INSTAPAY' ? `Instapay Handle: <code>${instapayHandle}</code><br/>` : ''}
             Need assistance? Reply to this email or visit <a href="https://novaralabs.eu" style="color: #ff6b00; text-decoration: none; font-weight: bold;">novaralabs.eu</a>
          </div>

          <div class="footer">&copy; ${new Date().getFullYear()} Novara Labs. High-performance research compounds.</div>
      </div>
  </body>
  </html>
  `;

  const orderData = {
    orderId,
    region,
    customer: { name, email, phone },
    shipping: { address1, address2, city, governorate },
    payment: {
      method: paymentMethod,
      instapayHandle: paymentMethod === 'INSTAPAY' ? instapayHandle : null
    },
    items: normalizedItems,
    notes,
    promoCode: safeStr(body.promoCode),
    discount: Number(body.discount) || 0,
    total: Number(body.total) || 0,
    status: 'AWAITING_REVIEW',
    createdAt: new Date(),
  };

  try {
    const client = await clientPromise;
    const db = client.db("NovaraLabs");
    await db.collection("orders").insertOne(orderData);

    // Update stock levels
    for (const item of normalizedItems) {
      if (item.size) {
        // Find if this specific size variant exists
        const inventoryItem = await db.collection("inventoryitems").findOne({ slug: item.slug });
        if (inventoryItem) {
          const hasVariant = inventoryItem.sizesEG && inventoryItem.sizesEG.some(sz => sz.size === item.size);
          
          if (hasVariant) {
            // Deduct from the specific variant's stock
            await db.collection("inventoryitems").updateOne(
              { slug: item.slug, "sizesEG.size": item.size },
              { $inc: { "sizesEG.$.stock": -item.quantity } }
            );
          } else {
            // Fallback to main stock
            await db.collection("inventoryitems").updateOne(
              { slug: item.slug },
              { $inc: { stock: -item.quantity } }
            );
          }
        }
      } else {
        // Fallback to main stock
        await db.collection("inventoryitems").updateOne(
          { slug: item.slug },
          { $inc: { stock: -item.quantity } }
        );
      }
    }

    await transporter.sendMail({
      from: fromAddress,
      to: supportAddress,
      replyTo: email,
      subject: supportSubject,
      html: supportHtml,
      text: `New Order: ${orderId}\nCustomer: ${name}\nItems: ${itemLines}`,
    });

    await transporter.sendMail({
      from: fromAddress,
      to: email,
      replyTo: supportAddress,
      subject: customerSubject,
      html: customerHtml,
      text: `Hi ${name}, Your order ${orderId} has been received.`,
    });

    return res.json({ success: true, orderId });
  } catch (err) {
    console.error('Error sending order email:', err);
    return res.status(500).json({ success: false, error: 'Failed to send email' });
  }
}

