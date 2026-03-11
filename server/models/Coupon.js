import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [20],
  },
  description: { type: String, default: '' },

  type: {
    type: String,
    enum: ['percentage', 'flat'],
    required: true,
  },
  value: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [1, 'Value must be at least 1'],
  },
  maxDiscount: {                                  // Cap for % coupons
    type: Number,
    default: null,
  },
  minOrderAmount: {
    type: Number,
    default: 0,
  },

  usageLimit:      { type: Number, default: null },  // null = unlimited
  usedCount:       { type: Number, default: 0 },
  perUserLimit:    { type: Number, default: 1 },

  usedBy: [{
    user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    usedAt: { type: Date, default: Date.now },
  }],

  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  applicableProducts:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

  validFrom:   { type: Date, required: true },
  validUntil:  { type: Date, required: true },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

// Virtual: is coupon currently valid
couponSchema.virtual('isValid').get(function () {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.validFrom &&
    now <= this.validUntil &&
    (this.usageLimit === null || this.usedCount < this.usageLimit)
  );
});

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;