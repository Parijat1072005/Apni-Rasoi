import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  getAllProducts, getProductBySlug, getRelatedProducts,
  createProduct, updateProduct, deleteProduct,
  updateStock, adminGetAllProducts,
} from '../controllers/productController.js';

const router = express.Router();

// Public
router.get('/',                    getAllProducts);
router.get('/admin/all',           protect, adminOnly, adminGetAllProducts);
router.get('/:slug',               getProductBySlug);
router.get('/:id/related',         getRelatedProducts);

// Admin
router.post('/',                   protect, adminOnly, createProduct);
router.put('/:id',                 protect, adminOnly, updateProduct);
router.delete('/:id',              protect, adminOnly, deleteProduct);
router.patch('/:id/stock',         protect, adminOnly, updateStock);

export default router;