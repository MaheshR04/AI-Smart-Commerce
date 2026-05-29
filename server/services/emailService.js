import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Helper to save sent email copy as a local styled HTML file for development sandboxing
const saveEmailLocalSandbox = (subject, htmlBody, email) => {
  try {
    const __dirname = path.resolve();
    const sandboxDir = path.join(__dirname, 'sent_emails');
    
    // Ensure directory exists
    if (!fs.existsSync(sandboxDir)) {
      fs.mkdirSync(sandboxDir, { recursive: true });
    }

    const cleanedSubject = subject.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const filename = `${Date.now()}_${email.replace(/[@.]/g, '_')}_${cleanedSubject}.html`;
    const filepath = path.join(sandboxDir, filename);

    fs.writeFileSync(filepath, htmlBody, 'utf8');
    
    console.log(`\n📬 [SANDBOX EMAIL] Email successfully generated!`);
    console.log(`Subject: "${subject}"`);
    console.log(`Recipient: ${email}`);
    console.log(`Local HTML File Path: file:///${filepath.replace(/\\/g, '/')}\n`);
  } catch (error) {
    console.error('Failed to save sandbox email:', error.message);
  }
};

// Configure Nodemailer Transport
const getTransporter = async () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user, pass },
    });
  }

  // Fallback to mock test account session if network is up
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (error) {
    // Return dummy transport to prevent server failures when offline
    return {
      sendMail: async () => {
        return { messageId: 'dummy_msg_id' };
      }
    };
  }
};

// Dispatch generic email wrap
const dispatchEmail = async (options) => {
  const { to, subject, html } = options;
  
  // 1. Always save a local styled HTML copy in the workspace folder for sandbox review
  saveEmailLocalSandbox(subject, html, to);

  // 2. Dispatch via nodemailer
  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: `"AI Smart Commerce" <noreply@aismartcommerce.com>`,
      to,
      subject,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 Mock Email SMTP Preview Link: ${previewUrl}`);
    }
    return true;
  } catch (error) {
    console.error('Error sending email via nodemailer:', error.message);
    return false;
  }
};

// BASE HTML EMAIL LAYOUT
const getBaseHtmlLayout = (title, headerColor, contentHtml) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      color: #334155;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border: 1px border-slate-200;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
    }
    .header {
      background-color: ${headerColor};
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .content {
      padding: 30px 25px;
      line-height: 1.6;
    }
    .footer {
      background-color: #f1f5f9;
      padding: 20px;
      text-align: center;
      font-size: 11px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
    .footer a {
      color: #0ea5e9;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} AI Smart Commerce. All Rights Reserved.</p>
      <p>Need support? Contact us at <a href="mailto:support@aismartcommerce.com">support@aismartcommerce.com</a></p>
    </div>
  </div>
</body>
</html>
`;

// 1. WELCOME EMAIL
export const sendWelcomeEmail = async (email, name) => {
  const content = `
    <h2 style="margin-top: 0; color: #1e293b; font-size: 18px; font-weight: 700;">Welcome, ${name}!</h2>
    <p>We are absolutely thrilled to welcome you to <strong>AI Smart Commerce</strong>, your premier destination for high-quality electronics, apparel, and home catalog items.</p>
    
    <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); border-radius: 12px; padding: 20px; color: #ffffff; margin: 25px 0; text-align: center;">
      <h3 style="margin: 0 0 5px 0; font-size: 13px; text-transform: uppercase; font-weight: 700; opacity: 0.9;">Special Opening Coupon Gift</h3>
      <span style="font-size: 26px; font-weight: 900; letter-spacing: 1px; display: block; margin: 10px 0;">WELCOME10</span>
      <p style="margin: 0; font-size: 11px; opacity: 0.85;">Unlock a flat 10% discount on your first checkout purchase of ₹1,000 or above.</p>
    </div>

    <p style="margin-bottom: 20px;">Get started now by setting up your shipping profiles and browsing our catalogs:</p>
    <div style="text-align: center; margin: 25px 0;">
      <a href="http://localhost:5173" style="background-color: #0ea5e9; color: #ffffff; padding: 12px 24px; border-radius: 10px; font-size: 12px; font-weight: 700; text-decoration: none; display: inline-block; box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.2);">Start Shopping Now</a>
    </div>

    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;">
    <p style="font-size: 11px; color: #64748b; margin: 0;">Your registered email is: <strong>${email}</strong>. For security, please keep your password confidential.</p>
  `;

  const html = getBaseHtmlLayout('Welcome to AI Smart Commerce', '#0ea5e9', content);
  return await dispatchEmail({
    to: email,
    subject: 'Welcome to AI Smart Commerce!',
    html,
  });
};

// 2. ORDER CONFIRMATION
export const sendOrderConfirmationEmail = async (email, name, order) => {
  const orderIdShort = order._id.toString().slice(-8).toUpperCase();
  
  // Generate items list table HTML
  let itemsHtml = `
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 11px;">
      <thead>
        <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; text-align: left;">
          <th style="padding: 10px; font-weight: 700; color: #475569;">Product Description</th>
          <th style="padding: 10px; font-weight: 700; color: #475569; text-align: center;">Qty</th>
          <th style="padding: 10px; font-weight: 700; color: #475569; text-align: right;">Unit Price</th>
        </tr>
      </thead>
      <tbody>
  `;

  order.products.forEach((p) => {
    itemsHtml += `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px; font-weight: 600; color: #334155;">${p.name}</td>
        <td style="padding: 10px; text-align: center; color: #64748b; font-weight: bold;">x${p.quantity}</td>
        <td style="padding: 10px; text-align: right; font-weight: bold; color: #334155;">₹${p.price.toLocaleString('en-IN')}</td>
      </tr>
    `;
  });

  itemsHtml += '</tbody></table>';

  // Shipping Address Card HTML
  const addr = order.shippingAddress;
  const addressHtml = `
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; margin: 20px 0; font-size: 11px;">
      <h4 style="margin: 0 0 8px 0; color: #475569; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Shipping Destination</h4>
      <p style="margin: 0; font-weight: 600; color: #334155;">${name}</p>
      <p style="margin: 3px 0 0 0; color: #64748b;">${addr.street}, ${addr.city}, ${addr.state} - ${addr.postalCode}</p>
      <p style="margin: 3px 0 0 0; color: #64748b;">Phone: ${addr.phone}</p>
    </div>
  `;

  // Total invoice billing breakdown
  const subtotal = order.products.reduce((acc, p) => acc + p.price * p.quantity, 0);
  const gstInclusive = Math.round((subtotal - subtotal / 1.18) * 100) / 100;
  const shippingCharge = subtotal - order.discountAmount < 1000 ? 99 : 0;

  const content = `
    <h2 style="margin-top: 0; color: #1e293b; font-size: 18px; font-weight: 700;">Purchase Successful!</h2>
    <p>Your order <strong>#${orderIdShort}</strong> has been logged in our databases. Thank you for placing your order with us!</p>
    
    ${addressHtml}

    <h3 style="font-size: 13px; font-weight: 700; color: #1e293b; margin: 20px 0 10px 0; text-transform: uppercase;">Items Ordered</h3>
    ${itemsHtml}

    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">

    <table style="width: 100%; border-collapse: collapse; font-size: 12px; font-weight: 600; color: #475569; margin-left: auto; max-width: 250px;">
      <tr>
        <td style="padding: 4px 0; text-align: left;">Subtotal:</td>
        <td style="padding: 4px 0; text-align: right; color: #334155;">₹${subtotal.toLocaleString('en-IN')}</td>
      </tr>
      ${order.discountAmount > 0 ? `
      <tr style="color: #10b981;">
        <td style="padding: 4px 0; text-align: left;">Coupon Discount:</td>
        <td style="padding: 4px 0; text-align: right;">-₹${order.discountAmount.toLocaleString('en-IN')}</td>
      </tr>
      ` : ''}
      <tr>
        <td style="padding: 4px 0; text-align: left;">Shipping Charges:</td>
        <td style="padding: 4px 0; text-align: right; color: #334155;">${shippingCharge > 0 ? `₹${shippingCharge}` : 'FREE'}</td>
      </tr>
      <tr style="font-size: 9px; color: #94a3b8;">
        <td style="padding: 2px 0; text-align: left;">(Incl. 18% GST:</td>
        <td style="padding: 2px 0; text-align: right;">₹${gstInclusive.toLocaleString('en-IN')})</td>
      </tr>
      <tr style="font-size: 14px; font-weight: 800; color: #1e293b; border-top: 2px solid #e2e8f0; height: 35px;">
        <td style="padding: 6px 0; text-align: left;">Total Payable:</td>
        <td style="padding: 6px 0; text-align: right; color: #0284c7;">₹${order.totalAmount.toLocaleString('en-IN')}</td>
      </tr>
    </table>

    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px; margin-top: 30px; text-align: center; font-size: 11px; font-weight: 700; color: #166534;">
      Payment Method: ${order.paymentMethod} | Status: Pending Dispatch
    </div>

    <div style="text-align: center; margin-top: 25px;">
      <a href="http://localhost:5173/orders" style="background-color: #334155; color: #ffffff; padding: 10px 20px; border-radius: 8px; font-size: 11px; font-weight: 700; text-decoration: none; display: inline-block;">Track in Dashboard</a>
    </div>
  `;

  const html = getBaseHtmlLayout(`Order Confirmation #${orderIdShort}`, '#334155', content);
  return await dispatchEmail({
    to: email,
    subject: `Order Confirmation #${orderIdShort} - Thank you for your purchase!`,
    html,
  });
};

// 3. PAYMENT CONFIRMATION
export const sendPaymentConfirmationEmail = async (email, name, order) => {
  const orderIdShort = order._id.toString().slice(-8).toUpperCase();
  const paymentId = order.paymentDetails?.razorpayPaymentId || `pay_sim_${Date.now()}`;
  
  const content = `
    <h2 style="margin-top: 0; color: #10b981; font-size: 18px; font-weight: 700; text-align: center;">Payment Captured Successfully!</h2>
    <p>We are pleased to confirm that payment for order <strong>#${orderIdShort}</strong> has been secured via online portal checkouts.</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 25px 0; font-size: 12px; font-weight: 600;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="height: 24px;">
          <td style="color: #64748b; font-weight: 500;">Order ID Reference:</td>
          <td style="color: #1e293b; text-align: right; font-weight: bold;">#${orderIdShort}</td>
        </tr>
        <tr style="height: 24px;">
          <td style="color: #64748b; font-weight: 500;">Razorpay Transaction ID:</td>
          <td style="color: #1e293b; text-align: right; font-family: monospace;">${paymentId}</td>
        </tr>
        <tr style="height: 24px;">
          <td style="color: #64748b; font-weight: 500;">Payment Gateway Mode:</td>
          <td style="color: #1e293b; text-align: right;">Razorpay Online Payout</td>
        </tr>
        <tr style="height: 24px; border-top: 1px solid #e2e8f0;">
          <td style="color: #64748b; font-weight: bold; padding-top: 8px;">Total Amount Paid:</td>
          <td style="color: #10b981; text-align: right; font-weight: 800; font-size: 15px; padding-top: 8px;">₹${order.totalAmount.toLocaleString('en-IN')}</td>
        </tr>
      </table>
    </div>

    <p style="margin: 20px 0;">Our packaging crews are already assembling your items. A shipping notification email containing carrier details and live delivery timelines will be triggered as soon as the package exits our warehouse gates.</p>

    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 12px; text-align: center; font-size: 11px; font-weight: 700; color: #1e40af;">
      Estimated Dispatch Schedule: 24 to 48 Hours
    </div>
  `;

  const html = getBaseHtmlLayout(`Payment Captured #${orderIdShort}`, '#10b981', content);
  return await dispatchEmail({
    to: email,
    subject: `Payment Successful Confirmation - Order #${orderIdShort}`,
    html,
  });
};

// 4. SHIPPING UPDATE
export const sendShippingUpdateEmail = async (email, name, order) => {
  const orderIdShort = order._id.toString().slice(-8).toUpperCase();
  const carrier = "SmartCommerce Express";
  const trackingNumber = `TRK${order._id.toString().slice(-6).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;

  const content = `
    <h2 style="margin-top: 0; color: #eab308; font-size: 18px; font-weight: 700;">Your Package Has Shipped!</h2>
    <p>Good news, ${name}! Your order <strong>#${orderIdShort}</strong> has been hand-packed and dispatched from our fulfillment center.</p>

    <div style="margin: 25px 0; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; font-size: 11px;">
      <div style="background-color: #fef08a; padding: 10px 15px; font-weight: bold; color: #854d0e;">
        🚚 Courier Dispatch Manifest
      </div>
      <div style="padding: 15px; background-color: #f8fafc; font-weight: 600; color: #475569;">
        <table style="width: 100%;">
          <tr style="height: 24px;">
            <td>Logistic Carrier:</td>
            <td style="text-align: right; color: #1e293b;">${carrier}</td>
          </tr>
          <tr style="height: 24px;">
            <td>Air Waybill (Tracking):</td>
            <td style="text-align: right; color: #1e293b; font-family: monospace;">${trackingNumber}</td>
          </tr>
          <tr style="height: 24px;">
            <td>Estimated Delivery:</td>
            <td style="text-align: right; color: #16a34a; font-weight: 700;">3 - 5 Business Days</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Timeline Progress Tracker visual inside email -->
    <div style="background-color: #f8fafc; padding: 15px; border-radius: 12px; text-align: center; margin: 25px 0;">
      <p style="margin: 0 0 10px 0; font-size: 10px; text-transform: uppercase; font-weight: 700; color: #64748b;">Active Order Status Flow</p>
      <div style="font-size: 12px; font-weight: bold; color: #cbd5e1;">
        <span style="color: #94a3b8;">Pending</span> &rarr; 
        <span style="color: #94a3b8;">Confirmed</span> &rarr; 
        <span style="color: #94a3b8;">Processing</span> &rarr; 
        <span style="color: #eab308; background-color: #fef9c3; padding: 2px 8px; border-radius: 4px;">SHIPPED</span> &rarr; 
        <span>Delivered</span>
      </div>
    </div>

    <p style="margin-top: 20px;">You can view detailed real-time logistics timelines or cancel/download billing receipts by logging into your account workspace.</p>

    <div style="text-align: center; margin: 20px 0;">
      <a href="http://localhost:5173/orders" style="background-color: #eab308; color: #ffffff; padding: 10px 20px; border-radius: 8px; font-size: 11px; font-weight: 700; text-decoration: none; display: inline-block; box-shadow: 0 4px 6px -1px rgba(234, 179, 8, 0.2);">Track Live Shipment</a>
    </div>
  `;

  const html = getBaseHtmlLayout(`Shipment Dispatched #${orderIdShort}`, '#eab308', content);
  return await dispatchEmail({
    to: email,
    subject: `Your package has shipped! - Order #${orderIdShort}`,
    html,
  });
};

// 5. DELIVERY UPDATE
export const sendDeliveryUpdateEmail = async (email, name, order) => {
  const orderIdShort = order._id.toString().slice(-8).toUpperCase();

  const content = `
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="background-color: #f0fdf4; border: 2px solid #86efac; width: 50px; height: 50px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 10px;">
        <span style="font-size: 24px; color: #16a34a;">✓</span>
      </div>
      <h2 style="margin: 0; color: #16a34a; font-size: 20px; font-weight: 800;">PACKAGE DELIVERED!</h2>
    </div>

    <p>Dear ${name}, our shipping coordinates indicate that order <strong>#${orderIdShort}</strong> has been successfully delivered and handed over at your shipping destination address!</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; margin: 25px 0; font-size: 11px;">
      <h4 style="margin: 0 0 6px 0; color: #475569; text-transform: uppercase;">Delivery Details Summary</h4>
      <p style="margin: 0; color: #334155;"><strong>Destination:</strong> ${order.shippingAddress.street}, ${order.shippingAddress.city}</p>
      <p style="margin: 3px 0 0 0; color: #334155;"><strong>Completion Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
      <p style="margin: 3px 0 0 0; color: #334155;"><strong>Final Billing Paid:</strong> ₹${order.totalAmount.toLocaleString('en-IN')} via ${order.paymentMethod}</p>
    </div>

    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;">

    <h3 style="font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 5px; text-align: center;">How did we do?</h3>
    <p style="text-align: center; margin: 0 0 20px 0; font-size: 11px; color: #64748b;">Please let us know how your new purchases fit by leaving a customer review.</p>

    <div style="text-align: center; margin: 20px 0;">
      <a href="http://localhost:5173/orders" style="background-color: #16a34a; color: #ffffff; padding: 12px 24px; border-radius: 10px; font-size: 12px; font-weight: 700; text-decoration: none; display: inline-block; box-shadow: 0 4px 6px -1px rgba(22, 163, 74, 0.2);">Write a Review</a>
    </div>

    <p style="font-size: 11px; color: #94a3b8; text-align: center;">If you did not receive this shipment, please contact our support desk immediately at support@aismartcommerce.com.</p>
  `;

  const html = getBaseHtmlLayout(`Shipment Delivered #${orderIdShort}`, '#16a34a', content);
  return await dispatchEmail({
    to: email,
    subject: `Delivered! Your package has arrived - Order #${orderIdShort}`,
    html,
  });
};
