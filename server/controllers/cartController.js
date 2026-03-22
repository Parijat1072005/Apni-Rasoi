import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// ── Helper: calculate totals ──────────────────────────────────────────────────
const calculateCartTotals = (cart) => {
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = cart.coupon?.discount || 0;
  const shippingCharge = subtotal >= 499 ? 0 : 60;   // Free shipping above ₹499
  const tax   = Math.round((subtotal - discount) * 0.05); // 5% GST
  const total = subtotal - discount + shippingCharge + tax;
  return { subtotal, discount, shippingCharge, tax, total };
};

// ── Get Cart ──────────────────────────────────────────────────────────────────
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name images isActive variants');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Remove items whose product was deactivated
    cart.items = cart.items.filter((item) => item.product?.isActive);
    await cart.save();

    const totals = calculateCartTotals(cart);
    console.log('Cart totals:', totals);
    return ApiResponse.success(res, { cart, totals });
  } catch (error) { next(error); }
};

// ── Add / Update Item ─────────────────────────────────────────────────────────
export const addToCart = async (req, res, next) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return ApiResponse.error(res, 'Product not available', 404);
    }

    const variant = product.variants.id(variantId);
    if (!variant) return ApiResponse.error(res, 'Variant not found', 404);
    if (variant.stock < quantity) {
      return ApiResponse.error(res, `Only ${variant.stock} units available`, 400);
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const existingIdx = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.variantId.toString() === variantId
    );

    if (existingIdx > -1) {
      const newQty = cart.items[existingIdx].quantity + quantity;
      if (newQty > 20) return ApiResponse.error(res, 'Max 20 units per item', 400);
      if (newQty > variant.stock) {
        return ApiResponse.error(res, `Only ${variant.stock} units in stock`, 400);
      }
      cart.items[existingIdx].quantity = newQty;
    } else {
      cart.items.push({
        product:      productId,
        variantId:    variantId,
        variantLabel: variant.label,
        quantity,
        price:        variant.price,
        name:         product.name,
        image:        product.images[0]?.url || '',
      });
    }

    await cart.save();
    const totals = calculateCartTotals(cart);
    console.log('Cart totals:', totals);
    return ApiResponse.success(res, { cart, totals }, 'Cart updated');
  } catch (error) { next(error); }
};

// ── Update Item Quantity ──────────────────────────────────────────────────────
export const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) return ApiResponse.error(res, 'Quantity must be at least 1', 400);

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return ApiResponse.error(res, 'Cart not found', 404);

    const item = cart.items.id(itemId);
    if (!item) return ApiResponse.error(res, 'Item not found in cart', 404);

    // Check stock
    const product = await Product.findById(item.product);
    const variant = product?.variants.id(item.variantId);
    if (!variant || variant.stock < quantity) {
      return ApiResponse.error(res, `Only ${variant?.stock || 0} units available`, 400);
    }

    item.quantity = quantity;
    await cart.save();
    const totals = calculateCartTotals(cart);
    console.log('Cart totals:', totals);
    return ApiResponse.success(res, { cart, totals }, 'Quantity updated');
  } catch (error) { next(error); }
};

// ── Remove Item ───────────────────────────────────────────────────────────────
export const removeCartItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return ApiResponse.error(res, 'Cart not found', 404);

    cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);
    await cart.save();
    const totals = calculateCartTotals(cart);
    console.log('Cart totals:', totals);
    return ApiResponse.success(res, { cart, totals }, 'Item removed');
  } catch (error) { next(error); }
};

// ── Clear Cart ────────────────────────────────────────────────────────────────
export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return ApiResponse.error(res, 'Cart not found', 404);
    cart.items = [];
    cart.coupon = { code: null, discount: 0, percentage: 0 };
    await cart.save();
    return ApiResponse.success(res, { cart }, 'Cart cleared');
  } catch (error) { next(error); }
};

// ── Apply Coupon ──────────────────────────────────────────────────────────────
export const applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || !cart.items.length) {
      return ApiResponse.error(res, 'Your cart is empty', 400);
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon || !coupon.isValid) {
      return ApiResponse.error(res, 'Invalid or expired coupon', 400);
    }

    const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
    if (subtotal < coupon.minOrderAmount) {
      return ApiResponse.error(
        res,
        `Minimum order of ₹${coupon.minOrderAmount} required for this coupon`,
        400
      );
    }

    // Check per-user usage limit
    const userUsage = coupon.usedBy.filter(
      (u) => u.user.toString() === req.user._id.toString()
    ).length;
    if (userUsage >= coupon.perUserLimit) {
      return ApiResponse.error(res, 'You have already used this coupon', 400);
    }

    let discount = 0;
    let percentage = 0;
    if (coupon.type === 'percentage') {
      discount = Math.round((subtotal * coupon.value) / 100);
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      percentage = coupon.value;
    } else {
      discount = coupon.value;
    }

    discount = Math.min(discount, subtotal); // Never exceed subtotal

    cart.coupon = { code: coupon.code, discount, percentage };
    await cart.save();
    const totals = calculateCartTotals(cart);
    console.log('Cart totals:', totals);

    return ApiResponse.success(res, { cart, totals, discount }, `Coupon applied! You save ₹${discount}`);
  } catch (error) { next(error); }
};

// ── Remove Coupon ─────────────────────────────────────────────────────────────
export const removeCoupon = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return ApiResponse.error(res, 'Cart not found', 404);
    cart.coupon = { code: null, discount: 0, percentage: 0 };
    await cart.save();
    const totals = calculateCartTotals(cart);
    console.log('Cart totals:', totals);
    return ApiResponse.success(res, { cart, totals }, 'Coupon removed');
  } catch (error) { next(error); }
};