import User from '../models/User.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import cloudinary from '../config/cloudinary.js';

// ── Get Profile ───────────────────────────────────────────────────────────────
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return ApiResponse.success(res, { user });
  } catch (error) { next(error); }
};

// ── Update Profile ────────────────────────────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'phone'];
    const updates = {};
    allowed.forEach((key) => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    return ApiResponse.success(res, { user }, 'Profile updated');
  } catch (error) { next(error); }
};

// ── Update Avatar ─────────────────────────────────────────────────────────────
export const updateAvatar = async (req, res, next) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return ApiResponse.error(res, 'Image is required', 400);

    const user = await User.findById(req.user._id);
    if (user.avatar?.publicId) {
      await cloudinary.uploader.destroy(user.avatar.publicId);
    }

    const result = await cloudinary.uploader.upload(imageBase64, {
      folder:         'apni-rasoi/avatars',
      transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }],
    });

    user.avatar = { url: result.secure_url, publicId: result.public_id };
    await user.save({ validateBeforeSave: false });

    return ApiResponse.success(res, { avatar: user.avatar }, 'Avatar updated');
  } catch (error) { next(error); }
};

// ── Wishlist ──────────────────────────────────────────────────────────────────
export const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('wishlist', 'name images basePrice slug ratings isActive');
    return ApiResponse.success(res, { wishlist: user.wishlist });
  } catch (error) { next(error); }
};

export const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);
    const idx = user.wishlist.indexOf(productId);
    let action;

    if (idx > -1) {
      user.wishlist.splice(idx, 1);
      action = 'removed';
    } else {
      user.wishlist.push(productId);
      action = 'added';
    }

    await user.save({ validateBeforeSave: false });
    return ApiResponse.success(res, { wishlist: user.wishlist }, `Product ${action} from wishlist`);
  } catch (error) { next(error); }
};

// ── Address Management ────────────────────────────────────────────────────────
export const addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.addresses.length >= 5) {
      return ApiResponse.error(res, 'Maximum 5 addresses allowed', 400);
    }
    if (req.body.isDefault) {
      user.addresses.forEach((a) => { a.isDefault = false; });
    }
    user.addresses.push(req.body);
    await user.save({ validateBeforeSave: false });
    return ApiResponse.success(res, { addresses: user.addresses }, 'Address added', 201);
  } catch (error) { next(error); }
};

export const updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) return ApiResponse.error(res, 'Address not found', 404);
    if (req.body.isDefault) {
      user.addresses.forEach((a) => { a.isDefault = false; });
    }
    Object.assign(address, req.body);
    await user.save({ validateBeforeSave: false });
    return ApiResponse.success(res, { addresses: user.addresses }, 'Address updated');
  } catch (error) { next(error); }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(
      (a) => a._id.toString() !== req.params.addressId
    );
    await user.save({ validateBeforeSave: false });
    return ApiResponse.success(res, { addresses: user.addresses }, 'Address deleted');
  } catch (error) { next(error); }
};

export const setDefaultAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.forEach((a) => {
      a.isDefault = a._id.toString() === req.params.addressId;
    });
    await user.save({ validateBeforeSave: false });
    return ApiResponse.success(res, { addresses: user.addresses }, 'Default address updated');
  } catch (error) { next(error); }
};

// ── Admin: All Users ──────────────────────────────────────────────────────────
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const filter = {};
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    if (role) filter.role = role;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-refreshToken');

    return ApiResponse.paginated(res, users, page, limit, total);
  } catch (error) { next(error); }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return ApiResponse.error(res, 'User not found', 404);
    return ApiResponse.success(res, { user });
  } catch (error) { next(error); }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return ApiResponse.error(res, 'Invalid role', 400);
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return ApiResponse.error(res, 'User not found', 404);
    return ApiResponse.success(res, { user }, 'Role updated');
  } catch (error) { next(error); }
};

export const blockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return ApiResponse.error(res, 'User not found', 404);
    if (user.role === 'admin') return ApiResponse.error(res, 'Cannot block an admin', 400);
    user.isBlocked = !user.isBlocked;
    await user.save({ validateBeforeSave: false });
    return ApiResponse.success(res, { isBlocked: user.isBlocked },
      user.isBlocked ? 'User blocked' : 'User unblocked');
  } catch (error) { next(error); }
};