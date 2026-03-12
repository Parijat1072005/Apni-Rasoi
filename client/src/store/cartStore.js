import { create } from 'zustand';
import { cartService } from '../services/cartService.js';
import toast from 'react-hot-toast';

const useCartStore = create((set, get) => ({
  cart: null,
  totals: { subtotal: 0, discount: 0, shippingCharge: 0, tax: 0, total: 0 },
  isLoading: false,
  isOpen: false,    // Cart drawer open state

  // ── Drawer ────────────────────────────────────────────────────────────────
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  // ── Fetch Cart ────────────────────────────────────────────────────────────
  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const { data } = await cartService.getCart();
      // Server: ApiResponse.success(res, { cart, totals })
      // Axios:  response.data = { success, message, data: { cart, totals } }
      const cartData = data?.data?.cart ?? null;
      const totalsData = data?.data?.totals ?? { subtotal: 0, discount: 0, shippingCharge: 0, tax: 0, total: 0 };
      set({ cart: cartData, totals: totalsData, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  // ── Add to Cart ───────────────────────────────────────────────────────────
  addToCart: async (productId, variantId, quantity = 1) => {
    try {
      const { data } = await cartService.addItem({ productId, variantId, quantity });
      set({ cart: data.data.cart, totals: data.data.totals });
      toast.success('Added to cart!');
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Could not add to cart';
      toast.error(msg);
      return { success: false, message: msg };
    }
  },

  // ── Update Quantity ───────────────────────────────────────────────────────
  updateQuantity: async (itemId, quantity) => {
    try {
      const { data } = await cartService.updateItem(itemId, { quantity });
      set({ cart: data.data.cart, totals: data.data.totals });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  },

  // ── Remove Item ───────────────────────────────────────────────────────────
  removeItem: async (itemId) => {
    try {
      const { data } = await cartService.removeItem(itemId);
      set({ cart: data.data.cart, totals: data.data.totals });
      toast.success('Item removed');
    } catch {
      toast.error('Could not remove item');
    }
  },

  // ── Apply Coupon ──────────────────────────────────────────────────────────
  applyCoupon: async (code) => {
    try {
      const { data } = await cartService.applyCoupon({ code });
      set({ cart: data.data.cart, totals: data.data.totals });
      toast.success(data.message);
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid coupon';
      toast.error(msg);
      return { success: false, message: msg };
    }
  },

  // ── Remove Coupon ─────────────────────────────────────────────────────────
  removeCoupon: async () => {
    try {
      const { data } = await cartService.removeCoupon();
      set({ cart: data.data.cart, totals: data.data.totals });
      toast.success('Coupon removed');
    } catch {
      toast.error('Could not remove coupon');
    }
  },

  // ── Clear (local) after order placed ─────────────────────────────────────
  clearLocal: () => set({ cart: null, totals: { subtotal: 0, discount: 0, shippingCharge: 0, tax: 0, total: 0 } }),

  // ── Item count helper ─────────────────────────────────────────────────────
  itemCount: () => get().cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0,
}));

export default useCartStore;