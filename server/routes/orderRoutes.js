import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  createRazorpayOrder, placeOrder,
  getMyOrders, getOrderById, cancelOrder,
  adminGetAllOrders, updateOrderStatus, getDashboardStats,
  trackOrder,
} from '../controllers/orderController.js';

const router = express.Router();

// Admin
router.get('/admin/all',           protect, adminOnly, adminGetAllOrders);
router.get('/admin/stats',         protect, adminOnly, getDashboardStats);
router.patch('/admin/:id/status',  protect, adminOnly, updateOrderStatus);

// Customer
router.post('/razorpay',           protect, createRazorpayOrder);
router.post('/place',              protect, placeOrder);
router.get('/my',                  protect, getMyOrders);
// Public route — track by orderNumber (no auth needed)
router.get('/track/:orderNumber', trackOrder);
router.get('/:id',                 protect, getOrderById);
router.patch('/:id/cancel',        protect, cancelOrder);



export default router;