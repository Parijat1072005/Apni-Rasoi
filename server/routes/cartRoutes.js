import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getCart, addToCart, updateCartItem,
  removeCartItem, clearCart, applyCoupon, removeCoupon,
} from '../controllers/cartController.js';

const router = express.Router();

router.use(protect); // All cart routes require auth

router.get('/',                        getCart);
router.post('/add',                    addToCart);
router.put('/item/:itemId',            updateCartItem);
router.delete('/item/:itemId',         removeCartItem);
router.delete('/clear',                clearCart);
router.post('/coupon',                 applyCoupon);
router.delete('/coupon',               removeCoupon);

export default router;