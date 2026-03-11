import express from 'express';
import { body } from 'express-validator';
import { protect, adminOnly } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getProfile, updateProfile, updateAvatar,
  addAddress, updateAddress, deleteAddress, setDefaultAddress,
  toggleWishlist, getWishlist,
  // Admin
  getAllUsers, getUserById, updateUserRole, blockUser,
} from '../controllers/userController.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// ── Customer routes ───────────────────────────────────────────────────────────
router.get('/profile',         protect, getProfile);
router.put('/profile',         protect, [
  body('name').optional().trim().isLength({ max: 60 }),
  body('phone').optional().matches(/^[6-9]\d{9}$/),
], validate, updateProfile);
router.post('/avatar',         protect, uploadLimiter, updateAvatar);
router.get('/wishlist',        protect, getWishlist);
router.post('/wishlist/:productId', protect, toggleWishlist);

// Address management
router.post('/address',                  protect, addAddress);
router.put('/address/:addressId',        protect, updateAddress);
router.delete('/address/:addressId',     protect, deleteAddress);
router.patch('/address/:addressId/default', protect, setDefaultAddress);

// ── Admin only ────────────────────────────────────────────────────────────────
router.get('/',               protect, adminOnly, getAllUsers);
router.get('/:id',            protect, adminOnly, getUserById);
router.patch('/:id/role',     protect, adminOnly, updateUserRole);
router.patch('/:id/block',    protect, adminOnly, blockUser);

export default router;