import Review from '../models/Review.js';
import Order from '../models/Order.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import cloudinary from '../config/cloudinary.js';

// ── Get Reviews for a Product ─────────────────────────────────────────────────
export const getProductReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const filter = { product: req.params.productId, isApproved: true };

    const total   = await Review.countDocuments(filter);
    const reviews = await Review.find(filter)
      .populate('user', 'name avatar')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Rating breakdown
    const breakdown = await Review.aggregate([
      { $match: filter },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    return ApiResponse.paginated(res, reviews, page, limit, total, 'Reviews fetched');
  } catch (error) { next(error); }
};

// ── Add Review (verified purchase only) ──────────────────────────────────────
export const addReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { orderId, rating, title, comment, imageBase64Array = [] } = req.body;

    // Verify the user actually bought this product
    const order = await Order.findOne({
      _id:    orderId,
      user:   req.user._id,
      status: 'delivered',
      'items.product': productId,
    });
    if (!order) {
      return ApiResponse.error(res, 'You can only review products you have purchased and received', 403);
    }

    const existingReview = await Review.findOne({ product: productId, user: req.user._id });
    if (existingReview) {
      return ApiResponse.error(res, 'You have already reviewed this product', 400);
    }

    // Upload review images
    const images = await Promise.all(
      imageBase64Array.slice(0, 3).map(async (base64) => {
        const result = await cloudinary.uploader.upload(base64, {
          folder: 'apni-rasoi/reviews',
          transformation: [{ width: 600, height: 600, crop: 'fill' }],
        });
        return { url: result.secure_url, publicId: result.public_id };
      })
    );

    const review = await Review.create({
      product: productId,
      user:    req.user._id,
      order:   orderId,
      rating,
      title,
      comment,
      images,
      isVerifiedPurchase: true,
    });

    // Mark order as reviewed
    order.isReviewed = true;
    await order.save();

    return ApiResponse.success(res, { review }, 'Review submitted. It will be visible after approval.', 201);
  } catch (error) { next(error); }
};

// ── Admin: Get All Reviews ────────────────────────────────────────────────────
export const adminGetAllReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isApproved } = req.query;
    const filter = {};
    if (isApproved !== undefined) filter.isApproved = isApproved === 'true';

    const total   = await Review.countDocuments(filter);
    const reviews = await Review.find(filter)
      .populate('user', 'name email')
      .populate('product', 'name')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return ApiResponse.paginated(res, reviews, page, limit, total);
  } catch (error) { next(error); }
};

// ── Admin: Approve / Reject Review ────────────────────────────────────────────
export const updateReviewStatus = async (req, res, next) => {
  try {
    const { isApproved } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    );
    if (!review) return ApiResponse.error(res, 'Review not found', 404);
    return ApiResponse.success(res, { review }, `Review ${isApproved ? 'approved' : 'rejected'}`);
  } catch (error) { next(error); }
};

// ── Admin: Delete Review ──────────────────────────────────────────────────────
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return ApiResponse.error(res, 'Review not found', 404);
    if (review.images?.length) {
      await Promise.all(review.images.map((img) => cloudinary.uploader.destroy(img.publicId)));
    }
    await review.deleteOne();
    return ApiResponse.success(res, {}, 'Review deleted');
  } catch (error) { next(error); }
};