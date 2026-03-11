import { useEffect } from 'react';
import useCartStore from '../store/cartStore.js';
import useAuthStore from '../store/authStore.js';

export const useCart = () => {
  const user      = useAuthStore((s) => s.user);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const cart      = useCartStore((s) => s.cart);
  const totals    = useCartStore((s) => s.totals);
  const isLoading = useCartStore((s) => s.isLoading);
  const isOpen    = useCartStore((s) => s.isOpen);
  const itemCount = useCartStore((s) => s.itemCount);
  const addToCart      = useCartStore((s) => s.addToCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem     = useCartStore((s) => s.removeItem);
  const applyCoupon    = useCartStore((s) => s.applyCoupon);
  const removeCoupon   = useCartStore((s) => s.removeCoupon);
  const openCart       = useCartStore((s) => s.openCart);
  const closeCart      = useCartStore((s) => s.closeCart);

  // Auto-fetch cart when user logs in
  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  return {
    cart, totals, isLoading, isOpen, itemCount,
    fetchCart, addToCart, updateQuantity, removeItem,
    applyCoupon, removeCoupon, openCart, closeCart,
  };
};