import cloudinary from '../config/cloudinary.js';  // ← configured instance
import Product  from '../models/Product.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// ── Helper: upload base64 to Cloudinary ───────────────────────────────────────
const uploadBase64 = async (base64String, folder = 'apni-rasoi/products') => {
  try {
    const result = await cloudinary.uploader.upload(base64String, {
      folder,
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });
    return { url: result.secure_url, publicId: result.public_id, alt: '' };
  } catch (err) {
    console.error('Cloudinary upload error:', err.message);
    return null;
  }
};

// ── Helper: delete image from Cloudinary ─────────────────────────────────────
const deleteFromCloudinary = async (publicId) => {
  if (!publicId || publicId.startsWith('seed-')) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
};

// ── PUBLIC: Get all products (with filters, sort, pagination) ─────────────────
export const getAllProducts = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 12, sort = '-createdAt',
      category, search, minPrice, maxPrice,
      isFeatured, isBestseller, isNewArrival, isSeasonal,
      tags,
    } = req.query;

    const filter = { isActive: true };

    if (category)    filter.category  = category;
    if (isFeatured   === 'true') filter.isFeatured   = true;
    if (isBestseller === 'true') filter.isBestseller = true;
    if (isNewArrival === 'true') filter.isNewArrival = true;
    if (isSeasonal   === 'true') filter.isSeasonal   = true;
    if (tags)        filter.tags = { $in: tags.split(',').map((t) => t.trim()) };

    if (minPrice || maxPrice) {
      filter.basePrice = {};
      if (minPrice) filter.basePrice.$gte = Number(minPrice);
      if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    return ApiResponse.success(res, {
      data: products,
      pagination: {
        total,
        page:  Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    }, 'Products fetched');
  } catch (error) {
    if (typeof next === 'function') return next(error);
    console.error(error);
    return ApiResponse.error(res, error.message || 'Server error');
  }
};

// ── ADMIN: Get all products (including inactive) ──────────────────────────────
export const adminGetAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, search } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name:        { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .lean();

    return ApiResponse.success(res, {
      data: products,
      pagination: {
        total,
        page:  Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    }, 'Products fetched');
  } catch (error) {
    if (typeof next === 'function') return next(error);
    console.error(error);
    return ApiResponse.error(res, error.message || 'Server error');
  }
};

// ── PUBLIC: Get single product by slug ────────────────────────────────────────
export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('category', 'name slug');

    if (!product) return ApiResponse.error(res, 'Product not found', 404);
    return ApiResponse.success(res, { product }, 'Product fetched');
  } catch (error) {
    if (typeof next === 'function') return next(error);
    console.error(error);
    return ApiResponse.error(res, error.message || 'Server error');
  }
};

// ── PUBLIC: Get related products ──────────────────────────────────────────────
export const getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return ApiResponse.error(res, 'Product not found', 404);

    const related = await Product.find({
      category: product.category,
      _id:      { $ne: product._id },
      isActive: true,
    })
      .limit(6)
      .lean();

    return ApiResponse.success(res, { products: related }, 'Related products fetched');
  } catch (error) {
    if (typeof next === 'function') return next(error);
    console.error(error);
    return ApiResponse.error(res, error.message || 'Server error');
  }
};

// ── ADMIN: Create product ─────────────────────────────────────────────────────
export const createProduct = async (req, res, next) => {
  try {
    const {
      name, description, shortDescription, category,
      variants, tags, ingredients,
      isFeatured, isBestseller, isNewArrival, isSeasonal,
      images: base64Images = [],
    } = req.body;

    // Upload base64 images to Cloudinary
    let uploadedImages = [];
    if (Array.isArray(base64Images) && base64Images.length > 0) {
      const results = await Promise.all(
        base64Images
          .filter((img) => typeof img === 'string' && img.startsWith('data:image'))
          .map((b64) => uploadBase64(b64))
      );
      uploadedImages = results.filter(Boolean);
    }

    const basePrice = Array.isArray(variants) && variants.length
      ? Math.min(...variants.map((v) => Number(v.price)))
      : 0;

    const product = await Product.create({
      name,
      description,
      shortDescription,
      category,
      variants,
      tags:         Array.isArray(tags) ? tags : [],
      ingredients:  Array.isArray(ingredients) ? ingredients : [],
      isFeatured:   isFeatured   ?? false,
      isBestseller: isBestseller ?? false,
      isNewArrival: isNewArrival ?? false,
      isSeasonal:   isSeasonal   ?? false,
      images:    uploadedImages,
      basePrice,
      isActive: true,
    });

    return ApiResponse.success(res, { product }, 'Product created', 201);
  } catch (error) {
    if (typeof next === 'function') return next(error);
    console.error(error);
    return ApiResponse.error(res, error.message || 'Server error');
  }
};

// ── ADMIN: Update product ─────────────────────────────────────────────────────
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return ApiResponse.error(res, 'Product not found', 404);

    const {
      newImages      = [],
      removeImageIds = [],
      images,            // ignored — use newImages/removeImageIds instead
      ...rest
    } = req.body;

    // Delete removed images from Cloudinary
    if (Array.isArray(removeImageIds) && removeImageIds.length > 0) {
      await Promise.all(removeImageIds.map(deleteFromCloudinary));
      product.images = product.images.filter(
        (img) => !removeImageIds.includes(img.publicId)
      );
    }

    // Upload new base64 images
    if (Array.isArray(newImages) && newImages.length > 0) {
      const uploaded = await Promise.all(
        newImages
          .filter((img) => typeof img === 'string' && img.startsWith('data:image'))
          .map((b64) => uploadBase64(b64))
      );
      product.images = [...product.images, ...uploaded.filter(Boolean)];
    }

    // Recalculate basePrice if variants changed
    if (Array.isArray(rest.variants) && rest.variants.length) {
      rest.basePrice = Math.min(...rest.variants.map((v) => Number(v.price)));
    }

    Object.assign(product, rest);
    await product.save();

    return ApiResponse.success(res, { product }, 'Product updated');
  } catch (error) {
    if (typeof next === 'function') return next(error);
    console.error(error);
    return ApiResponse.error(res, error.message || 'Server error');
  }
};

// ── ADMIN: Delete product ─────────────────────────────────────────────────────
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return ApiResponse.error(res, 'Product not found', 404);

    await Promise.all(product.images.map((img) => deleteFromCloudinary(img.publicId)));
    await product.deleteOne();

    return ApiResponse.success(res, null, 'Product deleted');
  } catch (error) { next(error); }
};

// ── ADMIN: Update stock ───────────────────────────────────────────────────────
export const updateStock = async (req, res, next) => {
  try {
    const { variantId, stock } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return ApiResponse.error(res, 'Product not found', 404);

    const variant = product.variants.id(variantId);
    if (!variant) return ApiResponse.error(res, 'Variant not found', 404);

    variant.stock = Number(stock);
    await product.save();

    return ApiResponse.success(res, { product }, 'Stock updated');
  } catch (error) { next(error); }
};