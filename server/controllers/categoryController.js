import Category from '../models/Category.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import cloudinary from '../config/cloudinary.js';

// ── Public ────────────────────────────────────────────────────────────────────
export const getAllCategories = async (req, res, next) => {
  try {
    const { includeInactive } = req.query;
    const filter = includeInactive === 'true' ? {} : { isActive: true };
    const categories = await Category.find(filter)
      .populate('parent', 'name slug')
      .sort({ sortOrder: 1, name: 1 });
    return ApiResponse.success(res, { categories });
  } catch (error) { next(error); }
};

export const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true })
      .populate('parent', 'name slug');
    if (!category) return ApiResponse.error(res, 'Category not found', 404);
    return ApiResponse.success(res, { category });
  } catch (error) { next(error); }
};

export const getSeasonalCategories = async (req, res, next) => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const categories = await Category.find({
      isSeasonal: true,
      isActive: true,
      seasonMonths: currentMonth,
    });
    return ApiResponse.success(res, { categories });
  } catch (error) { next(error); }
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, parent, isSeasonal, seasonMonths, sortOrder, imageBase64 } = req.body;

    let image = { url: '', publicId: '' };
    if (imageBase64) {
      const result = await cloudinary.uploader.upload(imageBase64, {
        folder: 'apni-rasoi/categories',
        transformation: [{ width: 600, height: 400, crop: 'fill' }],
      });
      image = { url: result.secure_url, publicId: result.public_id };
    }

    const category = await Category.create({
      name, description, parent: parent || null,
      isSeasonal, seasonMonths, sortOrder, image,
    });
    return ApiResponse.success(res, { category }, 'Category created', 201);
  } catch (error) { next(error); }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { imageBase64, ...rest } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) return ApiResponse.error(res, 'Category not found', 404);

    if (imageBase64) {
      if (category.image?.publicId) await cloudinary.uploader.destroy(category.image.publicId);
      const result = await cloudinary.uploader.upload(imageBase64, {
        folder: 'apni-rasoi/categories',
        transformation: [{ width: 600, height: 400, crop: 'fill' }],
      });
      rest.image = { url: result.secure_url, publicId: result.public_id };
    }

    Object.assign(category, rest);
    await category.save();
    return ApiResponse.success(res, { category }, 'Category updated');
  } catch (error) { next(error); }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return ApiResponse.error(res, 'Category not found', 404);
    if (category.image?.publicId) await cloudinary.uploader.destroy(category.image.publicId);
    await category.deleteOne();
    return ApiResponse.success(res, {}, 'Category deleted');
  } catch (error) { next(error); }
};