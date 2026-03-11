import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  label:          { type: String, required: true },   // e.g. "250g", "500g", "1kg"
  weight:         { type: Number, required: true },    // grams
  price:          { type: Number, required: true, min: 0 },
  comparePrice:   { type: Number, default: 0 },        // MRP / crossed price
  stock:          { type: Number, required: true, default: 0, min: 0 },
  sku:            { type: String, required: true },
}, { _id: true });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters'],
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [3000],
  },
  shortDescription: { type: String, maxlength: [300] },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
  },

  images: [{
    url:       { type: String, required: true },
    publicId:  { type: String, required: true },
    alt:       { type: String, default: '' },
  }],

  variants: {
    type: [variantSchema],
    validate: {
      validator: (arr) => arr.length > 0,
      message: 'At least one variant is required',
    },
  },

  // Quick access fields (derived from cheapest variant)
  basePrice:    { type: Number, required: true },
  comparePrice: { type: Number, default: 0 },

  ingredients:     [{ type: String }],
  tags:            [{ type: String, lowercase: true }],

  isFeatured:      { type: Boolean, default: false },
  isSeasonal:      { type: Boolean, default: false },
  isActive:        { type: Boolean, default: true },
  isBestseller:    { type: Boolean, default: false },
  isNewArrival:    { type: Boolean, default: false },

  // Aggregated review stats (updated on each review)
  ratings: {
    average:  { type: Number, default: 0, min: 0, max: 5 },
    count:    { type: Number, default: 0 },
  },

  totalSold: { type: Number, default: 0 },

  meta: {
    title:       { type: String, default: '' },
    description: { type: String, default: '' },
    keywords:    [{ type: String }],
  },
}, { timestamps: true });

// Indexes for fast querying
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Auto slug
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;