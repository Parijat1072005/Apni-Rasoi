import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product:      { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId:    { type: mongoose.Schema.Types.ObjectId, required: true },
  variantLabel: { type: String, required: true },
  name:         { type: String, required: true },
  image:        { type: String, default: '' },
  price:        { type: Number, required: true },
  quantity:     { type: Number, required: true, min: 1 },
}, { _id: true });

const shippingAddressSchema = new mongoose.Schema({
  fullName: String,
  phone:    String,
  line1:    String,
  line2:    String,
  city:     String,
  state:    String,
  pincode:  String,
}, { _id: false });

const statusHistorySchema = new mongoose.Schema({
  status:    { type: String, required: true },
  note:      { type: String, default: '' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  items: [orderItemSchema],
  shippingAddress: shippingAddressSchema,

  pricing: {
    subtotal:       { type: Number, required: true },
    shippingCharge: { type: Number, default: 0 },
    discount:       { type: Number, default: 0 },
    tax:            { type: Number, default: 0 },    // GST
    total:          { type: Number, required: true },
  },

  coupon: {
    code:       { type: String, default: null },
    discount:   { type: Number, default: 0 },
  },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
  },
  statusHistory: [statusHistorySchema],

  payment: {
    method:     { type: String, enum: ['razorpay', 'cod'], required: true },
    status:     { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    razorpayOrderId:   { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
    paidAt:     { type: Date },
  },

  shipping: {
    trackingNumber: { type: String, default: '' },
    carrier:        { type: String, default: '' },
    estimatedDelivery: { type: Date },
    shippedAt:      { type: Date },
    deliveredAt:    { type: Date },
  },

  notes: { type: String, default: '' },
  isReviewed: { type: Boolean, default: false },
}, { timestamps: true });

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });

// Auto-generate order number  e.g. AR-20240315-0001
orderSchema.pre('save', async function () {
  if (!this.isNew) return;
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const count = await mongoose.model('Order').countDocuments();
  this.orderNumber = `AR-${today}-${String(count + 1).padStart(4, '0')}`;
});

const Order = mongoose.model('Order', orderSchema);
export default Order;