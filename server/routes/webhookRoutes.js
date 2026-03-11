import express from 'express';
import crypto from 'crypto';
import Order from '../models/Order.js';
import { sendEmail, emailTemplates } from '../utils/sendEmail.js';
import User from '../models/User.js';

const router = express.Router();

// Razorpay sends raw body — must use express.raw() on this route
router.post(
  '/razorpay',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['x-razorpay-signature'];
    const secret    = process.env.RAZORPAY_KEY_SECRET;

    // ── Verify webhook signature ──────────────────────────────────────────────
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(req.body)
      .digest('hex');

    if (expectedSig !== signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const event = JSON.parse(req.body.toString());

    try {
      switch (event.event) {

        case 'payment.captured': {
          const paymentId = event.payload.payment.entity.id;
          const orderId   = event.payload.payment.entity.order_id;

          const order = await Order.findOne({ 'payment.razorpayOrderId': orderId })
            .populate('user', 'name email');

          if (order && order.payment.status !== 'paid') {
            order.payment.status          = 'paid';
            order.payment.razorpayPaymentId = paymentId;
            order.payment.paidAt          = new Date();
            order.status                  = 'confirmed';
            order.statusHistory.push({
              status: 'confirmed',
              note:   'Payment captured via webhook',
            });
            await order.save();

            // Send confirmation email
            if (order.user?.email) {
              const { subject, html } = emailTemplates.orderConfirmation(
                order.user.name, order
              );
              sendEmail({ to: order.user.email, subject, html }).catch(() => {});
            }
          }
          break;
        }

        case 'payment.failed': {
          const orderId = event.payload.payment.entity.order_id;
          await Order.findOneAndUpdate(
            { 'payment.razorpayOrderId': orderId },
            {
              'payment.status': 'failed',
              status: 'cancelled',
              $push: {
                statusHistory: {
                  status: 'cancelled',
                  note:   'Payment failed — auto cancelled',
                },
              },
            }
          );
          break;
        }

        case 'refund.processed': {
          const paymentId = event.payload.refund.entity.payment_id;
          await Order.findOneAndUpdate(
            { 'payment.razorpayPaymentId': paymentId },
            {
              'payment.status': 'refunded',
              status: 'refunded',
              $push: { statusHistory: { status: 'refunded', note: 'Refund processed by Razorpay' } },
            }
          );
          break;
        }
      }
    } catch (err) {
      console.error('Webhook processing error:', err.message);
    }

    // Always return 200 to Razorpay immediately
    res.status(200).json({ received: true });
  }
);

export default router;