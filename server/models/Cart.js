import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  variantLabel: { type: String, required: true },   // "250g"
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    max: [20, 'Max 20 units per item'],
  },
  price:        { type: Number, required: true },   // snapshot at time of add
  name:         { type: String, required: true },   // snapshot
  image:        { type: String, default: '' },      // snapshot
}, { _id: true, timestamps: true });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
  coupon: {
    code:       { type: String, default: null },
    discount:   { type: Number, default: 0 },       // flat rupees off
    percentage: { type: Number, default: 0 },
  },
}, { timestamps: true });

// Virtual: cart subtotal
cartSchema.virtual('subtotal').get(function () {
  return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;