import nodemailer from 'nodemailer';

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  FROM_EMAIL,
} = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT) || 587,
  secure: SMTP_SECURE === 'true',
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

const commonStyle = `
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f9f9f9; }
        .container { max-width: 600px; margin: 20px auto; padding: 40px; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #1a1a1a; padding-bottom: 20px; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 15px; }
        .status-accepted { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
        .status-rejected { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
        .status-shipped { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
        .status-completed { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
        
        h1 { font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin: 0; color: #1a1a1a; }
        p { font-size: 14px; color: #444; margin: 15px 0; }
        
        .footer { margin-top: 40px; font-size: 12px; color: #666; text-align: center; border-top: 1px dotted #ccc; padding-top: 20px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 20px; }
    </style>
`;

export const sendStatusEmail = async (order, newStatus) => {
  const customerEmail = order.customer?.email;
  if (!customerEmail) return;

  let subject = '';
  let contentHtml = '';
  const orderIdShort = order.orderId || order._id.toString().slice(-8).toUpperCase();

  switch (newStatus) {
    case 'PENDING': // Admin accepted
      subject = `Order Accepted: ${orderIdShort} — Novara Labs`;
      contentHtml = `
        <div class="status-badge status-accepted">ACCEPTED</div>
        <h1>Your order has been accepted</h1>
        <p>Great news! Your order <strong>#${orderIdShort}</strong> has been reviewed and accepted by our team. We are now preparing it for shipment.</p>
        <p>You will receive another update as soon as your package is on its way.</p>
      `;
      break;
    case 'REJECTED':
      subject = `Order Update: ${orderIdShort} — Novara Labs`;
      contentHtml = `
        <div class="status-badge status-rejected">REJECTED</div>
        <h1>Notification Regarding Your Order</h1>
        <p>We regret to inform you that your order <strong>#${orderIdShort}</strong> could not be processed at this time and has been rejected.</p>
        <p>If you have any questions or believe this is an error, please contact our support team immediately.</p>
      `;
      break;
    case 'SHIPPED':
      subject = `Order Shipped: ${orderIdShort} — Novara Labs`;
      contentHtml = `
        <div class="status-badge status-shipped">SHIPPED</div>
        <h1>Package on the Way</h1>
        <p>Your order <strong>#${orderIdShort}</strong> has been shipped and is currently in transit to your location.</p>
        <p>Our logistics partner will contact you shortly to coordinate the final delivery.</p>
      `;
      break;
    case 'COMPLETED':
      subject = `Order Fulfilled: ${orderIdShort} — Novara Labs`;
      contentHtml = `
        <div class="status-badge status-completed">COMPLETED</div>
        <h1>Thank You for Choosing Novara Labs</h1>
        <p>Your order <strong>#${orderIdShort}</strong> has been successfully delivered and completed.</p>
        <p>We hope you are satisfied with your products. We look forward to serving you again in the future.</p>
        <a href="https://novaralabs.eu" class="button">Visit Our Store</a>
      `;
      break;
    default:
      return;
  }

  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>${commonStyle}</head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://novaralabs.eu/logo.png" alt="Novara Labs" style="height: 30px; margin-bottom: 15px;">
                <p style="margin: 0; font-size: 10px; font-weight: 700; color: #999; text-transform: uppercase; letter-spacing: 0.2em;">Official Notification</p>
            </div>
            ${contentHtml}
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Novara Labs • Distribution Core</p>
                <p style="font-size: 10px;">This is an automated notification. Please do not reply directly to this email.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: FROM_EMAIL || SMTP_USER,
      to: customerEmail,
      subject: subject,
      html: fullHtml,
    });
    console.log(`Status email sent to ${customerEmail} for status ${newStatus}`);
  } catch (error) {
    console.error(`Failed to send status email to ${customerEmail}:`, error);
  }
};
