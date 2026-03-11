import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  validateCoupon, getAllCoupons, createCoupon, updateCoupon, deleteCoupon,
} from '../controllers/couponController.js';

const router = express.Router();

router.post('/validate',    protect, validateCoupon);

router.get('/admin',        protect, adminOnly, getAllCoupons);
router.post('/admin',       protect, adminOnly, createCoupon);
router.put('/admin/:id',    protect, adminOnly, updateCoupon);
router.delete('/admin/:id', protect, adminOnly, deleteCoupon);

export default router;