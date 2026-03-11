import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import StarRating from './StarRating.jsx';
import useCartStore from '../../store/cartStore.js';
import { useWishlist } from '../../hooks/useWishlist.js';

export default function ProductCard({ product }) {
  const addToCart = useCartStore((s) => s.addToCart);
  const openCart  = useCartStore((s) => s.openCart);
  const { isInWishlist, toggle } = useWishlist();

  if (!product) return null;

  const defaultVariant = product.variants?.[0];
  const discount = defaultVariant?.comparePrice > defaultVariant?.price
    ? Math.round(((defaultVariant.comparePrice - defaultVariant.price) / defaultVariant.comparePrice) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!defaultVariant) return;
    const result = await addToCart(product._id, defaultVariant._id, 1);
    if (result.success) openCart();
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    toggle(product._id);
  };

  return (
    <Link to={`/products/${product.slug}`} className="group block">
      <div className="card-product relative overflow-hidden">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-brand-50">
          <img
            src={product.images?.[0]?.url || '/placeholder-pickle.jpg'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <Badge className="bg-spice text-white text-xs border-0">{discount}% OFF</Badge>
            )}
            {product.isBestseller && (
              <Badge className="bg-turmeric text-brand-900 text-xs border-0">⭐ Bestseller</Badge>
            )}
            {product.isNewArrival && (
              <Badge className="bg-brand-600 text-white text-xs border-0">New</Badge>
            )}
            {product.isSeasonal && (
              <Badge className="bg-purple-500 text-white text-xs border-0">Seasonal</Badge>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
          >
            <Heart
              className={cn(
                'w-4 h-4 transition-colors',
                isInWishlist(product._id) ? 'fill-red-500 text-red-500' : 'text-gray-500'
              )}
            />
          </button>

          {/* Quick add overlay */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              className="w-full py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" /> Quick Add
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-xs text-brand-600 font-medium uppercase tracking-wide mb-1 truncate">
            {product.category?.name}
          </p>
          <h3 className="font-medium text-gray-800 text-sm leading-tight line-clamp-2 mb-2 group-hover:text-brand-700 transition-colors">
            {product.name}
          </h3>
          <StarRating rating={product.ratings?.average} count={product.ratings?.count} />
          <div className="flex items-center gap-2 mt-2">
            <span className="font-bold text-brand-800 text-base">₹{product.basePrice}</span>
            {defaultVariant?.comparePrice > defaultVariant?.price && (
              <span className="text-xs text-gray-400 line-through">₹{defaultVariant.comparePrice}</span>
            )}
          </div>
          {defaultVariant?.stock === 0 && (
            <p className="text-xs text-red-500 mt-1 font-medium">Out of Stock</p>
          )}
          {defaultVariant?.stock > 0 && defaultVariant.stock <= 5 && (
            <p className="text-xs text-orange-500 mt-1 font-medium">Only {defaultVariant.stock} left!</p>
          )}
        </div>
      </div>
    </Link>
  );
}