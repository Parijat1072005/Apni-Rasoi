import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Heart, ChevronLeft, ChevronRight, Minus, Plus, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import StarRating from '../components/product/StarRating.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import { productService } from '../services/productService.js';
import { reviewService } from '../services/reviewService.js';
import useCartStore from '../store/cartStore.js';
import { useWishlist } from '../hooks/useWishlist.js';

export default function ProductDetailPage() {
  const { slug }   = useParams();
  const addToCart  = useCartStore((s) => s.addToCart);
  const openCart   = useCartStore((s) => s.openCart);
  const { isInWishlist, toggle } = useWishlist();

  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [quantity, setQuantity]   = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [adding, setAdding]       = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn:  () => productService.getBySlug(slug),
    select:   (d) => d.data.data.product,
  });

  // ── Fix: use useEffect instead of removed onSuccess ────────────────────────
  useEffect(() => {
    if (product?.variants?.length) {
      setSelectedVariantId(product.variants[0]._id);
      setQuantity(1);
      setActiveImg(0);
    }
  }, [product?._id]);

  const { data: related } = useQuery({
    queryKey: ['related', product?._id],
    queryFn:  () => productService.getRelated(product._id),
    select:   (d) => d.data.data.products,
    enabled:  !!product?._id,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', product?._id],
    queryFn:  () => reviewService.getProductReviews(product._id),
    select:   (d) => d.data,
    enabled:  !!product?._id,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🫙</div>
          <h2 className="font-display text-2xl text-brand-800">Product not found</h2>
          <Button asChild className="mt-4 bg-brand-700 hover:bg-brand-800">
            <Link to="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  const selectedVariant = product.variants?.find((v) => v._id === selectedVariantId)
    ?? product.variants?.[0];

  const inStock  = (selectedVariant?.stock ?? 0) > 0;
  const discount = selectedVariant?.comparePrice > selectedVariant?.price
    ? Math.round(((selectedVariant.comparePrice - selectedVariant.price) / selectedVariant.comparePrice) * 100)
    : 0;

  const handleAddToCart = async () => {
    const variantId = selectedVariantId ?? product.variants?.[0]?._id;
    if (!variantId) return;
    if (!inStock)   return;
    setAdding(true);
    const result = await addToCart(product._id, variantId, quantity);
    if (result.success) openCart();
    setAdding(false);
  };

  const images = product.images?.length
    ? product.images
    : [{ url: '/placeholder.jpg', alt: product.name }];

  return (
    <div className="bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-brand-700">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-brand-700">Products</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category?._id}`} className="hover:text-brand-700">
            {product.category?.name}
          </Link>
          <span>/</span>
          <span className="text-gray-800 truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Main grid */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-brand-100 shadow-sm group">
              <img
                src={images[activeImg]?.url}
                alt={images[activeImg]?.alt || product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-spice text-white border-0 text-sm">{discount}% OFF</Badge>
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImg((i) => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={cn(
                      'w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all',
                      i === activeImg
                        ? 'border-brand-700 shadow-md'
                        : 'border-brand-100 hover:border-brand-300'
                    )}>
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div>
              <Link
                to={`/products?category=${product.category?._id}`}
                className="text-brand-600 font-medium text-sm hover:text-brand-800 transition-colors">
                {product.category?.name}
              </Link>
              <h1 className="font-display text-3xl lg:text-4xl text-brand-900 mt-1 leading-tight">
                {product.name}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <StarRating rating={product.ratings?.average} count={product.ratings?.count} size="md" />
              {product.totalSold > 0 && (
                <span className="text-xs text-gray-400">{product.totalSold} sold</span>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-display text-4xl font-bold text-brand-800">
                ₹{selectedVariant?.price ?? product.basePrice}
              </span>
              {selectedVariant?.comparePrice > selectedVariant?.price && (
                <span className="text-lg text-gray-400 line-through">₹{selectedVariant.comparePrice}</span>
              )}
              {discount > 0 && (
                <Badge className="bg-green-100 text-green-700 border-0">
                  You save ₹{selectedVariant.comparePrice - selectedVariant.price}
                </Badge>
              )}
            </div>

            {product.shortDescription && (
              <p className="text-gray-600 leading-relaxed">{product.shortDescription}</p>
            )}

            <Separator />

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div>
                <p className="font-semibold text-sm text-gray-700 mb-3">
                  Size / Weight:{' '}
                  <span className="text-brand-700">{selectedVariant?.label}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v._id}
                      onClick={() => { setSelectedVariantId(v._id); setQuantity(1); }}
                      disabled={v.stock === 0}
                      className={cn(
                        'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                        v._id === selectedVariantId
                          ? 'border-brand-700 bg-brand-50 text-brand-800'
                          : 'border-gray-200 text-gray-600 hover:border-brand-300',
                        v.stock === 0 && 'opacity-40 cursor-not-allowed line-through'
                      )}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock status */}
            <div>
              {!inStock ? (
                <Badge variant="destructive">Out of Stock</Badge>
              ) : selectedVariant?.stock <= 5 ? (
                <Badge className="bg-orange-100 text-orange-700 border-0">
                  Only {selectedVariant.stock} left!
                </Badge>
              ) : (
                <Badge className="bg-green-100 text-green-700 border-0">In Stock</Badge>
              )}
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-brand-200 rounded-lg">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-11 flex items-center justify-center hover:bg-brand-50 transition-colors rounded-l-lg">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(selectedVariant?.stock ?? 1, q + 1))}
                  disabled={quantity >= (selectedVariant?.stock ?? 1)}
                  className="w-10 h-11 flex items-center justify-center hover:bg-brand-50 transition-colors rounded-r-lg disabled:opacity-40">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={!inStock || adding}
                className="flex-1 bg-brand-700 hover:bg-brand-800 text-white font-semibold py-6 gap-2 text-base disabled:opacity-60">
                <ShoppingCart className="w-5 h-5" />
                {adding ? 'Adding...' : inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => toggle(product._id)}
                className="w-11 h-11 border-brand-200 shrink-0">
                <Heart
                  className={cn(
                    'w-5 h-5',
                    isInWishlist(product._id) && 'fill-red-500 text-red-500'
                  )}
                />
              </Button>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {product.tags?.map((tag) => (
                <Badge key={tag} variant="secondary"
                  className="bg-brand-50 text-brand-600 border-brand-200 text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="description" className="mb-16">
          <TabsList className="bg-brand-50 border border-brand-100">
            <TabsTrigger value="description"
              className="data-[state=active]:bg-white data-[state=active]:text-brand-800">
              Description
            </TabsTrigger>
            <TabsTrigger value="ingredients"
              className="data-[state=active]:bg-white data-[state=active]:text-brand-800">
              Ingredients
            </TabsTrigger>
            <TabsTrigger value="reviews"
              className="data-[state=active]:bg-white data-[state=active]:text-brand-800">
              Reviews ({product.ratings?.count || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description"
            className="mt-6 bg-white rounded-2xl p-6 border border-brand-100">
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
          </TabsContent>

          <TabsContent value="ingredients"
            className="mt-6 bg-white rounded-2xl p-6 border border-brand-100">
            {product.ingredients?.length ? (
              <div className="flex flex-wrap gap-2">
                {product.ingredients.map((ing) => (
                  <Badge key={ing} variant="secondary"
                    className="bg-brand-50 text-brand-700 border-brand-200">
                    {ing}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Ingredient list not available.</p>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            {reviewsData?.data?.length ? (
              <div className="space-y-4">
                {reviewsData.data.map((review) => (
                  <div key={review._id}
                    className="bg-white rounded-2xl p-5 border border-brand-100">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-700 text-sm">
                          {review.user?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{review.user?.name}</p>
                          <StarRating rating={review.rating} size="sm" />
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    {review.title && (
                      <p className="font-semibold text-sm text-gray-800 mb-1">{review.title}</p>
                    )}
                    <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                    {review.isVerifiedPurchase && (
                      <Badge className="mt-3 bg-green-50 text-green-700 border-green-200 text-xs">
                        ✓ Verified Purchase
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-brand-100">
                <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No reviews yet. Be the first to review!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Related */}
        {related?.length > 0 && (
          <section>
            <h2 className="font-display text-2xl text-brand-900 mb-6">You Might Also Like</h2>
            <ProductGrid products={related} cols={4} />
          </section>
        )}
      </div>
    </div>
  );
}