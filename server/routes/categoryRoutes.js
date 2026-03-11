import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  getAllCategories, getCategoryBySlug, getSeasonalCategories,
  createCategory, updateCategory, deleteCategory,
} from '../controllers/categoryController.js';

const router = express.Router();

// Public
router.get('/',           getAllCategories);
router.get('/seasonal',   getSeasonalCategories);
router.get('/:slug',      getCategoryBySlug);

// Admin
router.post('/',          protect, adminOnly, createCategory);
router.put('/:id',        protect, adminOnly, updateCategory);
router.delete('/:id',     protect, adminOnly, deleteCategory);

export default router;