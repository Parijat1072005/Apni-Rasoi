import nodemailer from 'nodemailer';

const createTransporter = () => nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth:   { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  return transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
};

// ── Shared layout wrapper ──────────────────────────────────────────────────────
const layout = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Apni Rasoi</title>
</head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#052e16 0%,#15803d 100%);padding:32px 40px;text-align:center;">
            <div style="width:52px;height:52px;background:rgba(255,255,255,0.15);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;font-size:28px;">🌿</div>
            <h1 style="margin:0;color:#ffffff;font-size:26px;letter-spacing:-0.5px;">Apni Rasoi</h1>
            <p style="margin:4px 0 0;color:#86efac;font-size:13px;font-family:'Arial',sans-serif;">Handcrafted Pickles & Seasonal Delicacies</p>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:40px;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f0fdf4;padding:24px 40px;text-align:center;border-top:1px solid #dcfce7;">
            <p style="margin:0;color:#16a34a;font-size:13px;font-family:'Arial',sans-serif;">© ${new Date().getFullYear()} Apni Rasoi. Made with 🌿 in India</p>
            <p style="margin:8px 0 0;color:#86efac;font-size:11px;font-family:'Arial',sans-serif;">New Delhi, India &nbsp;|&nbsp; hello@apnirasoi.com</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const btn = (url, text, color = '#15803d') =>
  `<a href="${url}" style="display:inline-block;margin-top:24px;padding:14px 32px;background:${color};color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;font-family:'Arial',sans-serif;">${text}</a>`;

const divider = `<hr style="border:none;border-top:1px solid #dcfce7;margin:28px 0;" />`;

// ── Templates ──────────────────────────────────────────────────────────────────
export const emailTemplates = {

  welcome: (name) => ({
    subject: '🌿 Welcome to Apni Rasoi — Taste of Ghar Ka Khana!',
    html: layout(`
      <h2 style="color:#14532d;font-size:22px;margin:0 0 8px;">Namaste, ${name}! 🙏</h2>
      <p style="color:#166534;font-size:15px;line-height:1.7;font-family:'Arial',sans-serif;margin:0 0 16px;">
        Welcome to <strong>Apni Rasoi</strong> — your home for authentic, handmade pickles and seasonal Indian delicacies crafted from recipes passed down through generations.
      </p>
      <div style="background:#f0fdf4;border-left:4px solid #15803d;padding:16px 20px;border-radius:8px;margin:20px 0;">
        <p style="margin:0;color:#15803d;font-size:14px;font-family:'Arial',sans-serif;"><strong>What's waiting for you:</strong></p>
        <ul style="margin:10px 0 0;padding-left:20px;color:#166534;font-size:14px;font-family:'Arial',sans-serif;line-height:1.8;">
          <li>🫙 Premium Mango, Lemon & Mixed Pickles</li>
          <li>🎊 Seasonal specials — Gujiya, Mathri & more</li>
          <li>🚚 Free shipping on orders above ₹499</li>
          <li>⭐ 100% natural, no preservatives</li>
        </ul>
      </div>
      ${btn(`${process.env.CLIENT_URL}/products`, 'Start Shopping →')}
      ${divider}
      <p style="color:#9ca3af;font-size:12px;font-family:'Arial',sans-serif;margin:0;">
        If you didn't create this account, you can safely ignore this email.
      </p>
    `),
  }),

  passwordReset: (name, resetUrl) => ({
    subject: '🔑 Reset your Apni Rasoi password',
    html: layout(`
      <h2 style="color:#14532d;font-size:22px;margin:0 0 8px;">Password Reset Request</h2>
      <p style="color:#374151;font-size:15px;line-height:1.7;font-family:'Arial',sans-serif;margin:0 0 16px;">
        Hi <strong>${name}</strong>, we received a request to reset the password for your Apni Rasoi account.
      </p>
      <div style="background:#fef9c3;border:1px solid #fde047;padding:14px 18px;border-radius:8px;margin:20px 0;">
        <p style="margin:0;color:#92400e;font-size:13px;font-family:'Arial',sans-serif;">
          ⏱️ <strong>This link expires in 10 minutes.</strong> If you didn't request this, your account is safe — no action needed.
        </p>
      </div>
      ${btn(resetUrl, 'Reset My Password', '#dc2626')}
      ${divider}
      <p style="color:#9ca3af;font-size:12px;font-family:'Arial',sans-serif;margin:0;">
        If the button doesn't work, copy and paste this URL into your browser:<br />
        <span style="color:#15803d;word-break:break-all;">${resetUrl}</span>
      </p>
    `),
  }),

  orderConfirmation: (name, order) => ({
    subject: `✅ Order Confirmed — ${order.orderNumber}`,
    html: layout(`
      <h2 style="color:#14532d;font-size:22px;margin:0 0 4px;">Order Confirmed! 🎉</h2>
      <p style="color:#374151;font-size:15px;line-height:1.6;font-family:'Arial',sans-serif;margin:0 0 24px;">
        Hi <strong>${name}</strong>, your order has been placed successfully. We'll start preparing it right away!
      </p>

      <!-- Order Number Box -->
      <div style="background:#f0fdf4;border:2px solid #86efac;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
        <p style="margin:0 0 4px;color:#166534;font-size:12px;font-family:'Arial',sans-serif;text-transform:uppercase;letter-spacing:1px;">Order Number</p>
        <p style="margin:0;color:#14532d;font-size:22px;font-weight:bold;font-family:'Courier New',monospace;">${order.orderNumber}</p>
      </div>

      <!-- Items Table -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr style="background:#f0fdf4;">
          <td style="padding:10px 12px;font-size:12px;color:#166534;font-family:'Arial',sans-serif;font-weight:bold;text-transform:uppercase;">Item</td>
          <td style="padding:10px 12px;font-size:12px;color:#166534;font-family:'Arial',sans-serif;font-weight:bold;text-transform:uppercase;text-align:center;">Qty</td>
          <td style="padding:10px 12px;font-size:12px;color:#166534;font-family:'Arial',sans-serif;font-weight:bold;text-transform:uppercase;text-align:right;">Price</td>
        </tr>
        ${order.items.map((item) => `
        <tr style="border-bottom:1px solid #f0fdf4;">
          <td style="padding:12px;font-size:14px;color:#374151;font-family:'Arial',sans-serif;">
            ${item.name}<br/>
            <span style="font-size:12px;color:#9ca3af;">${item.variantLabel}</span>
          </td>
          <td style="padding:12px;font-size:14px;color:#374151;font-family:'Arial',sans-serif;text-align:center;">${item.quantity}</td>
          <td style="padding:12px;font-size:14px;color:#374151;font-family:'Arial',sans-serif;text-align:right;font-weight:600;">₹${item.price * item.quantity}</td>
        </tr>`).join('')}
      </table>

      <!-- Pricing Summary -->
      ${divider}
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:4px 0;font-size:14px;color:#6b7280;font-family:'Arial',sans-serif;">Subtotal</td><td style="text-align:right;font-size:14px;color:#374151;font-family:'Arial',sans-serif;">₹${order.pricing.subtotal}</td></tr>
        ${order.pricing.discount > 0 ? `<tr><td style="padding:4px 0;font-size:14px;color:#16a34a;font-family:'Arial',sans-serif;">Discount</td><td style="text-align:right;font-size:14px;color:#16a34a;font-family:'Arial',sans-serif;">-₹${order.pricing.discount}</td></tr>` : ''}
        <tr><td style="padding:4px 0;font-size:14px;color:#6b7280;font-family:'Arial',sans-serif;">Shipping</td><td style="text-align:right;font-size:14px;color:#374151;font-family:'Arial',sans-serif;">${order.pricing.shippingCharge === 0 ? 'FREE' : `₹${order.pricing.shippingCharge}`}</td></tr>
        <tr><td style="padding:4px 0;font-size:14px;color:#6b7280;font-family:'Arial',sans-serif;">GST (5%)</td><td style="text-align:right;font-size:14px;color:#374151;font-family:'Arial',sans-serif;">₹${order.pricing.tax}</td></tr>
        <tr style="border-top:2px solid #dcfce7;">
          <td style="padding:12px 0 4px;font-size:16px;color:#14532d;font-family:'Arial',sans-serif;font-weight:bold;">Total</td>
          <td style="text-align:right;font-size:18px;color:#14532d;font-family:'Arial',sans-serif;font-weight:bold;padding:12px 0 4px;">₹${order.pricing.total}</td>
        </tr>
      </table>

      <!-- Shipping Address -->
      ${divider}
      <p style="margin:0 0 8px;font-size:13px;color:#166534;font-family:'Arial',sans-serif;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;">Shipping To</p>
      <p style="margin:0;font-size:14px;color:#374151;font-family:'Arial',sans-serif;line-height:1.7;">
        ${order.shippingAddress.fullName}<br/>
        ${order.shippingAddress.line1}${order.shippingAddress.line2 ? ', ' + order.shippingAddress.line2 : ''}<br/>
        ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br/>
        📞 ${order.shippingAddress.phone}
      </p>

      ${btn(`${process.env.CLIENT_URL}/orders/${order._id}`, 'Track My Order →')}
    `),
  }),

  orderShipped: (name, order) => ({
    subject: `🚚 Your order ${order.orderNumber} has been shipped!`,
    html: layout(`
      <h2 style="color:#14532d;font-size:22px;margin:0 0 8px;">Your order is on the way! 🚚</h2>
      <p style="color:#374151;font-size:15px;line-height:1.7;font-family:'Arial',sans-serif;margin:0 0 24px;">
        Hi <strong>${name}</strong>, great news — your order <strong>${order.orderNumber}</strong> has been shipped and is heading your way!
      </p>
      ${order.shipping?.trackingNumber ? `
      <div style="background:#eff6ff;border:1px solid #bfdbfe;padding:16px 20px;border-radius:10px;margin:20px 0;">
        <p style="margin:0 0 4px;font-size:12px;color:#1d4ed8;font-family:'Arial',sans-serif;text-transform:uppercase;letter-spacing:0.5px;">Tracking Number</p>
        <p style="margin:0;font-size:20px;font-family:'Courier New',monospace;color:#1e3a8a;font-weight:bold;">${order.shipping.trackingNumber}</p>
        ${order.shipping.carrier ? `<p style="margin:6px 0 0;font-size:12px;color:#6b7280;font-family:'Arial',sans-serif;">via ${order.shipping.carrier}</p>` : ''}
      </div>` : ''}
      ${btn(`${process.env.CLIENT_URL}/orders/${order._id}`, 'Track My Order →', '#1d4ed8')}
    `),
  }),

  orderDelivered: (name, order) => ({
    subject: `🎉 Order ${order.orderNumber} delivered! Leave a review`,
    html: layout(`
      <h2 style="color:#14532d;font-size:22px;margin:0 0 8px;">Order Delivered! 🎉</h2>
      <p style="color:#374151;font-size:15px;line-height:1.7;font-family:'Arial',sans-serif;margin:0 0 16px;">
        Hi <strong>${name}</strong>, your order <strong>${order.orderNumber}</strong> has been delivered. We hope you love every bite!
      </p>
      <div style="background:#fefce8;border:1px solid #fde047;padding:16px 20px;border-radius:10px;margin:20px 0;">
        <p style="margin:0;color:#92400e;font-size:14px;font-family:'Arial',sans-serif;">
          ⭐ <strong>Enjoyed your pickles?</strong> Share your experience and help other pickle lovers discover the best flavours!
        </p>
      </div>
      ${btn(`${process.env.CLIENT_URL}/orders/${order._id}`, 'Write a Review ⭐', '#d97706')}
    `),
  }),
};