import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [60, 'Name cannot exceed 60 characters'],
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  },
  description: { type: String, default: '' },
  image: {
    url:       { type: String, default: '' },
    publicId:  { type: String, default: '' },
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  isSeasonal:   { type: Boolean, default: false },
  seasonMonths: {                                    // e.g. [2, 3] for Holi (Mar)
    type: [Number],
    default: [],
    validate: {
      validator: (arr) => arr.every((m) => m >= 1 && m <= 12),
      message: 'Season months must be between 1 and 12',
    },
  },
  isActive:   { type: Boolean, default: true },
  sortOrder:  { type: Number, default: 0 },
}, { timestamps: true });

// Auto-generate slug from name
categorySchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
});

const Category = mongoose.model('Category', categorySchema);
export default Category;