import { useState, useEffect } from 'react';
import { userService } from '../services/userService.js';
import useAuthStore from '../store/authStore.js';
import toast from 'react-hot-toast';

export const useWishlist = () => {
  const user      = useAuthStore((s) => s.user);
  const [wishlist, setWishlist] = useState([]);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (user) fetchWishlist();
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const { data } = await userService.getWishlist();
      setWishlist(data.data.wishlist.map((p) => p._id));
    } catch { /* silent */ }
  };

  const toggle = async (productId) => {
    if (!user) { toast.error('Please login to use wishlist'); return; }
    setLoading(true);
    try {
      await userService.toggleWishlist(productId);
      setWishlist((prev) =>
        prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId]
      );
      toast.success(
        wishlist.includes(productId) ? 'Removed from wishlist' : 'Added to wishlist'
      );
    } catch { toast.error('Could not update wishlist'); }
    finally { setLoading(false); }
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  return { wishlist, isInWishlist, toggle, loading };
};