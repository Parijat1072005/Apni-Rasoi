import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import useCartStore from '../store/cartStore.js';
import useAuthStore from '../store/authStore.js';

export default function CartPage() {
  const user           = useAuthStore((s) => s.user);
  const cart           = useCartStore((s) => s.cart);
  const totals         = useCartStore((s) => s.totals);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem     = useCartStore((s) => s.removeItem);
  const applyCoupon    = useCartStore((s) => s.applyCoupon);
  const removeCoupon   = useCartStore((s) => s.removeCoupon);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const items = cart?.items || [];

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    await applyCoupon(couponCode.trim());
    setCouponLoading(false);
    setCouponCode('');
  };

  if (!items.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="text-8xl mb-6">🛒</div>
        <h2 className="font-display text-3xl text-brand-800 mb-3">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything yet</p>
        <Button asChild className="bg-brand-700 hover:bg-brand-800 text-white px-8">
          <Link to="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl text-brand-900 mb-8">Your Cart ({items.length} items)</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item._id} className="bg-white rounded-2xl border border-brand-100 p-4 flex gap-4">
              <Link to={`/products/${item.product?.slug || '#'}`}
                className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-brand-50 border border-brand-100">
                <img src={item.image || '/placeholder.jpg'} alt={item.name}
                  className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product?.slug || '#'}`}
                  className="font-medium text-gray-800 hover:text-brand-700 transition-colors line-clamp-2 text-sm leading-tight">
                  {item.name}
                </Link>
                <p className="text-xs text-gray-500 mt-0.5">{item.variantLabel}</p>
                <p className="font-bold text-brand-800 mt-1">₹{item.price}</p>
              </div>
              <div className="flex flex-col items-end justify-between gap-2 shrink-0">
                <button onClick={() => removeItem(item._id)}
                  className="text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div>
                  <p className="text-xs text-gray-400 text-right mb-1">
                    Subtotal: <span className="font-semibold text-gray-700">₹{item.price * item.quantity}</span>
                  </p>
                  <div className="flex items-center border border-brand-200 rounded-lg">
                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center hover:bg-brand-50 disabled:opacity-40 rounded-l-lg">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-brand-50 rounded-r-lg">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="bg-white rounded-2xl border border-brand-100 p-5">
            <p className="font-semibold text-sm text-gray-800 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-brand-600" /> Have a coupon?
            </p>
            {cart?.coupon?.code ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <div>
                  <p className="font-semibold text-green-700 text-sm">{cart.coupon.code}</p>
                  <p className="text-xs text-green-600">Saving ₹{cart.coupon.discount}</p>
                </div>
                <button onClick={removeCoupon} className="text-green-600 hover:text-red-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="HOLI2024" className="h-9 border-brand-200 text-sm uppercase" />
                <Button type="submit" size="sm" disabled={couponLoading}
                  className="bg-brand-700 hover:bg-brand-800 text-white shrink-0">
                  {couponLoading ? '...' : 'Apply'}
                </Button>
              </form>
            )}
          </div>

          {/* Totals */}
          <div className="bg-white rounded-2xl border border-brand-100 p-5 space-y-3">
            <p className="font-display text-lg text-brand-900">Order Summary</p>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.length} items)</span>
                <span>₹{totals.subtotal}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount</span><span>-₹{totals.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{totals.shippingCharge === 0
                  ? <span className="text-green-600 font-medium">FREE</span>
                  : `₹${totals.shippingCharge}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (5%)</span><span>₹{totals.tax}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-brand-900">
              <span className="font-display text-lg">Total</span>
              <span className="text-xl">₹{totals.total}</span>
            </div>

            {totals.shippingCharge > 0 && (
              <p className="text-xs text-center text-amber-600 bg-amber-50 rounded-lg py-2">
                Add ₹{499 - totals.subtotal} more for FREE shipping!
              </p>
            )}

            {user ? (
              <Button asChild className="w-full bg-brand-700 hover:bg-brand-800 text-white font-semibold py-5 text-base">
                <Link to="/checkout">Proceed to Checkout →</Link>
              </Button>
            ) : (
              <Button asChild className="w-full bg-brand-700 hover:bg-brand-800 text-white font-semibold py-5">
                <Link to="/login" state={{ from: { pathname: '/checkout' } }}>Login to Checkout</Link>
              </Button>
            )}
            <Button asChild variant="ghost" className="w-full text-brand-600 hover:text-brand-800">
              <Link to="/products">← Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}