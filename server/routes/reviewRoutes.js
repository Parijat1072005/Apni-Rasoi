import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  getProductReviews, addReview,
  adminGetAllReviews, updateReviewStatus, deleteReview,
} from '../controllers/reviewController.js';

const router = express.Router();

router.get('/product/:productId',        getProductReviews);
router.post('/product/:productId',       protect, addReview);

router.get('/admin/all',                 protect, adminOnly, adminGetAllReviews);
router.patch('/admin/:id/status',        protect, adminOnly, updateReviewStatus);
router.delete('/admin/:id',              protect, adminOnly, deleteReview);

export default router;