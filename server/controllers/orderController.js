import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { sendEmail, emailTemplates } from '../utils/sendEmail.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// ── Lazy Razorpay instance — only created when first called ───────────────────
let _razorpay = null;
const getRazorpay = () => {
  if (!_razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env');
    }
    _razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return _razorpay;
};

// ── Create Razorpay Order ─────────────────────────────────────────────────────
export const createRazorpayOrder = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || !cart.items.length) {
      return ApiResponse.error(res, 'Cart is empty', 400);
    }

    const subtotal      = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const discount      = cart.coupon?.discount || 0;
    const shippingCharge = subtotal >= 499 ? 0 : 60;
    const tax           = Math.round((subtotal - discount) * 0.05);
    const total         = subtotal - discount + shippingCharge + tax;

    const rzpOrder = await getRazorpay().orders.create({
      amount:   Math.round(total * 100), // paise
      currency: 'INR',
      receipt:  `receipt_${Date.now()}`,
    });

    return ApiResponse.success(res, {
      razorpayOrderId: rzpOrder.id,
      amount:          rzpOrder.amount,
      currency:        rzpOrder.currency,
      keyId:           process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) { next(error); }
};

// ── Place Order (after payment verified OR COD) ───────────────────────────────
export const placeOrder = async (req, res, next) => {
  try {
    const {
      shippingAddress, paymentMethod,
      razorpayOrderId, razorpayPaymentId, razorpaySignature,
    } = req.body;

    if (!shippingAddress) return ApiResponse.error(res, 'Shipping address is required', 400);

    // ── Verify Razorpay signature for online payments ──
    if (paymentMethod === 'razorpay') {
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return ApiResponse.error(res, 'Payment details missing', 400);
      }
      const generatedSig = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSig !== razorpaySignature) {
        return ApiResponse.error(res, 'Payment verification failed', 400);
      }
    }

    // ── Fetch cart ────────────────────────────────────────────────────────────
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || !cart.items.length) {
      return ApiResponse.error(res, 'Cart is empty', 400);
    }

    // ── Validate stock and deduct ─────────────────────────────────────────────
    const stockOps = [];
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return ApiResponse.error(res, `"${item.name}" is no longer available`, 400);
      }
      const variant = product.variants.id(item.variantId);
      if (!variant || variant.stock < item.quantity) {
        return ApiResponse.error(res, `Insufficient stock for "${item.name} (${item.variantLabel})"`, 400);
      }
      stockOps.push({ product, variant, quantity: item.quantity });
    }

    // All good — deduct stock
    for (const { product, variant, quantity } of stockOps) {
      variant.stock     -= quantity;
      product.totalSold += quantity;
      await product.save();
    }

    // ── Calculate pricing ─────────────────────────────────────────────────────
    const subtotal      = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const discount      = cart.coupon?.discount || 0;
    const shippingCharge = subtotal >= 499 ? 0 : 60;
    const tax           = Math.round((subtotal - discount) * 0.05);
    const total         = subtotal - discount + shippingCharge + tax;

    // ── Create order ──────────────────────────────────────────────────────────
    const order = await Order.create({
      user:            req.user._id,
      items:           cart.items.map((i) => ({
        product:      i.product,
        variantId:    i.variantId,
        variantLabel: i.variantLabel,
        name:         i.name,
        image:        i.image,
        price:        i.price,
        quantity:     i.quantity,
      })),
      shippingAddress,
      pricing:         { subtotal, shippingCharge, discount, tax, total },
      coupon:          cart.coupon?.code ? { code: cart.coupon.code, discount } : {},
      payment: {
        method:             paymentMethod,
        status:             paymentMethod === 'razorpay' ? 'paid' : 'pending',
        razorpayOrderId:    razorpayOrderId   || '',
        razorpayPaymentId:  razorpayPaymentId || '',
        razorpaySignature:  razorpaySignature || '',
        paidAt:             paymentMethod === 'razorpay' ? new Date() : undefined,
      },
      statusHistory: [{ status: 'pending', note: 'Order placed', updatedBy: req.user._id }],
    });

    // ── Mark coupon as used ───────────────────────────────────────────────────
    if (cart.coupon?.code) {
      await Coupon.findOneAndUpdate(
        { code: cart.coupon.code },
        {
          $inc: { usedCount: 1 },
          $push: { usedBy: { user: req.user._id } },
        }
      );
    }

    // ── Clear cart ────────────────────────────────────────────────────────────
    cart.items  = [];
    cart.coupon = { code: null, discount: 0, percentage: 0 };
    await cart.save();

    // ── Send order confirmation email (non-blocking) ──────────────────────────
    const { subject, html } = emailTemplates.orderConfirmation(
      req.user.name, order.orderNumber, total
    );
    sendEmail({ to: req.user.email, subject, html }).catch(() => {});

    return ApiResponse.success(res, { order }, 'Order placed successfully', 201);
  } catch (error) { next(error); }
};

// ── Get My Orders ─────────────────────────────────────────────────────────────
export const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const total  = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-statusHistory -payment.razorpaySignature');

    return ApiResponse.paginated(res, orders, page, limit, total);
  } catch (error) { next(error); }
};

// ── Get Single Order ──────────────────────────────────────────────────────────
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone');

    if (!order) return ApiResponse.error(res, 'Order not found', 404);

    // Users can only view their own orders; admins can view all
    if (
      req.user.role !== 'admin' &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      return ApiResponse.error(res, 'Not authorized', 403);
    }

    return ApiResponse.success(res, { order });
  } catch (error) { next(error); }
};

// ── Cancel Order (User) ───────────────────────────────────────────────────────
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return ApiResponse.error(res, 'Order not found', 404);

    if (order.user.toString() !== req.user._id.toString()) {
      return ApiResponse.error(res, 'Not authorized', 403);
    }

    const cancellableStatuses = ['pending', 'confirmed'];
    if (!cancellableStatuses.includes(order.status)) {
      return ApiResponse.error(res, 'Order cannot be cancelled at this stage', 400);
    }

    // Restore stock
    for (const item of order.items) {
      await Product.findOneAndUpdate(
        { _id: item.product, 'variants._id': item.variantId },
        {
          $inc: {
            'variants.$.stock': item.quantity,
            totalSold: -item.quantity,
          },
        }
      );
    }

    order.status = 'cancelled';
    order.statusHistory.push({
      status:    'cancelled',
      note:      req.body.reason || 'Cancelled by customer',
      updatedBy: req.user._id,
    });
    await order.save();

    return ApiResponse.success(res, { order }, 'Order cancelled successfully');
  } catch (error) { next(error); }
};

// ── Admin: Get All Orders ─────────────────────────────────────────────────────
export const adminGetAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus, search } = req.query;
    const filter = {};
    if (status)        filter.status          = status;
    if (paymentStatus) filter['payment.status'] = paymentStatus;
    if (search)        filter.orderNumber = { $regex: search, $options: 'i' };

    const total  = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return ApiResponse.paginated(res, orders, page, limit, total);
  } catch (error) { next(error); }
};

// ── Admin: Update Order Status ────────────────────────────────────────────────
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note, trackingNumber, carrier } = req.body;

    const validStatuses = ['confirmed','processing','shipped','delivered','cancelled','refunded'];
    if (!validStatuses.includes(status)) {
      return ApiResponse.error(res, 'Invalid status', 400);
    }

    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return ApiResponse.error(res, 'Order not found', 404);

    order.status = status;
    order.statusHistory.push({ status, note: note || '', updatedBy: req.user._id });

    if (status === 'shipped') {
      order.shipping.shippedAt = new Date();
      if (trackingNumber) order.shipping.trackingNumber = trackingNumber;
      if (carrier)        order.shipping.carrier        = carrier;

      // Email: shipped
      if (order.user?.email) {
        const { subject, html } = emailTemplates.orderShipped(order.user.name, order);
        sendEmail({ to: order.user.email, subject, html }).catch(() => {});
      }
    }

    if (status === 'delivered') {
      order.shipping.deliveredAt = new Date();
      order.payment.status = 'paid';

      // Email: delivered + review prompt
      if (order.user?.email) {
        const { subject, html } = emailTemplates.orderDelivered(order.user.name, order);
        sendEmail({ to: order.user.email, subject, html }).catch(() => {});
      }
    }

    if (status === 'refunded') order.payment.status = 'refunded';

    await order.save();
    return ApiResponse.success(res, { order }, 'Order status updated');
  } catch (error) { next(error); }
};

// ── Admin: Dashboard Stats ────────────────────────────────────────────────────
export const getDashboardStats = async (req, res, next) => {
  try {
    const now         = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay   = new Date(now.setHours(0, 0, 0, 0));

    const [
      totalOrders, totalRevenue,
      todayOrders, monthOrders,
      pendingOrders, deliveredOrders,
      revenueByMonth, topProducts,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { 'payment.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } },
      ]),
      Order.countDocuments({ createdAt: { $gte: startOfDay } }),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'delivered' }),

      // Revenue per month (last 6 months)
      Order.aggregate([
        { $match: { 'payment.status': 'paid', createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } } },
        { $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$pricing.total' },
          orders:  { $sum: 1 },
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      // Top 5 selling products
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.product', name: { $first: '$items.name' }, sold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { sold: -1 } },
        { $limit: 5 },
      ]),
    ]);

    return ApiResponse.success(res, {
      totalOrders,
      totalRevenue:     totalRevenue[0]?.total || 0,
      todayOrders,
      monthOrders,
      pendingOrders,
      deliveredOrders,
      revenueByMonth,
      topProducts,
    });
  } catch (error) { next(error); }
};