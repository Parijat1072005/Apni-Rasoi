import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { userService } from '../services/userService.js';
import useCartStore from '../store/cartStore.js';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const queryClient = useQueryClient();
  const addToCart   = useCartStore((s) => s.addToCart);
  const openCart    = useCartStore((s) => s.openCart);

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn:  () => userService.getWishlist(),
    select:   (d) => d.data.data.wishlist,
  });

  const removeMutation = useMutation({
    mutationFn: (productId) => userService.toggleWishlist(productId),
    onSuccess:  () => queryClient.invalidateQueries(['wishlist']),
  });

  const handleAddToCart = async (product) => {
    const variant = product.variants?.[0];
    if (!variant) return;
    const result = await addToCart(product._id, variant._id, 1);
    if (result.success) openCart();
  };

  if (!wishlist.length && !isLoading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
      <h2 className="font-display text-2xl text-brand-800 mb-2">Your wishlist is empty</h2>
      <p className="text-gray-500 text-sm mb-6">Save items you love for later</p>
      <Button asChild className="bg-brand-700 hover:bg-brand-800">
        <Link to="/products">Explore Products</Link>
      </Button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl text-brand-900 mb-8">My Wishlist ({wishlist.length})</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {wishlist.map((product) => (
          <div key={product._id} className="bg-white rounded-2xl border border-brand-100 overflow-hidden group">
            <Link to={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden bg-brand-50">
              <img src={product.images?.[0]?.url} alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <button onClick={(e) => { e.preventDefault(); removeMutation.mutate(product._id); }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors">
                <Heart className="w-4 h-4 fill-red-500 text-red-500" />
              </button>
            </Link>
            <div className="p-3">
              <Link to={`/products/${product.slug}`}
                className="text-sm font-medium text-gray-800 hover:text-brand-700 line-clamp-2 leading-tight">
                {product.name}
              </Link>
              <p className="font-bold text-brand-800 mt-1">₹{product.basePrice}</p>
              <Button size="sm" onClick={() => handleAddToCart(product)}
                className="w-full mt-2 bg-brand-700 hover:bg-brand-800 text-white gap-1.5 text-xs">
                <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}