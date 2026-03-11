import Coupon from '../models/Coupon.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// ── Public: Validate Coupon ───────────────────────────────────────────────────
export const validateCoupon = async (req, res, next) => {
  try {
    const { code, cartTotal } = req.body;
    const coupon = await Coupon.findOne({ code: code?.toUpperCase() });

    if (!coupon || !coupon.isValid) {
      return ApiResponse.error(res, 'Invalid or expired coupon', 400);
    }
    if (cartTotal < coupon.minOrderAmount) {
      return ApiResponse.error(res, `Minimum order ₹${coupon.minOrderAmount} required`, 400);
    }

    const userUsage = coupon.usedBy.filter(
      (u) => u.user.toString() === req.user._id.toString()
    ).length;
    if (userUsage >= coupon.perUserLimit) {
      return ApiResponse.error(res, 'Coupon already used', 400);
    }

    let discount = coupon.type === 'percentage'
      ? Math.min(Math.round((cartTotal * coupon.value) / 100), coupon.maxDiscount || Infinity)
      : coupon.value;
    discount = Math.min(discount, cartTotal);

    return ApiResponse.success(res, {
      code:          coupon.code,
      type:          coupon.type,
      value:         coupon.value,
      discount,
      description:   coupon.description,
    }, `Coupon valid! You save ₹${discount}`);
  } catch (error) { next(error); }
};

// ── Admin: CRUD ───────────────────────────────────────────────────────────────
export const getAllCoupons = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isActive } = req.query;
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const total   = await Coupon.countDocuments(filter);
    const coupons = await Coupon.find(filter)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-usedBy');

    return ApiResponse.paginated(res, coupons, page, limit, total);
  } catch (error) { next(error); }
};

export const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    return ApiResponse.success(res, { coupon }, 'Coupon created', 201);
  } catch (error) { next(error); }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!coupon) return ApiResponse.error(res, 'Coupon not found', 404);
    return ApiResponse.success(res, { coupon }, 'Coupon updated');
  } catch (error) { next(error); }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return ApiResponse.error(res, 'Coupon not found', 404);
    return ApiResponse.success(res, {}, 'Coupon deleted');
  } catch (error) { next(error); }
};