import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Min rating is 1'],
    max: [5, 'Max rating is 5'],
  },
  title:    { type: String, maxlength: 100 },
  comment:  { type: String, maxlength: 1000 },
  images: [{
    url:      String,
    publicId: String,
  }],
  isVerifiedPurchase: { type: Boolean, default: true },
  isApproved:         { type: Boolean, default: false },  // Admin approves before public
  helpfulVotes:       { type: Number, default: 0 },
}, { timestamps: true });

// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Update product's aggregated rating after save/delete
const updateProductRating = async (productId) => {
  const stats = await mongoose.model('Review').aggregate([
    { $match: { product: productId, isApproved: true } },
    { $group: {
        _id: '$product',
        average: { $avg: '$rating' },
        count:   { $sum: 1 },
    }},
  ]);

  const average = stats.length ? Math.round(stats[0].average * 10) / 10 : 0;
  const count   = stats.length ? stats[0].count : 0;

  await mongoose.model('Product').findByIdAndUpdate(productId, {
    'ratings.average': average,
    'ratings.count': count,
  });
};

reviewSchema.post('save', function () {
  updateProductRating(this.product);
});

reviewSchema.post('findOneAndDelete', function (doc) {
  if (doc) updateProductRating(doc.product);
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;