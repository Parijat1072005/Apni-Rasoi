import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import useCartStore from '../../store/cartStore.js';

export default function CartDrawer() {
  const isOpen         = useCartStore((s) => s.isOpen);
  const closeCart      = useCartStore((s) => s.closeCart);
  const cart           = useCartStore((s) => s.cart);
  const totals         = useCartStore((s) => s.totals);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem     = useCartStore((s) => s.removeItem);

  const items = cart?.items || [];

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent side="right" className="w-full sm:w-96 flex flex-col p-0">
        <SheetHeader className="px-4 py-4 border-b border-brand-100">
          <SheetTitle className="font-display text-brand-800 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Your Cart
            {items.length > 0 && (
              <Badge className="bg-brand-700 ml-auto">{items.length} items</Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4">
              <div className="text-6xl">🫙</div>
              <p className="font-display text-xl text-brand-800">Your cart is empty</p>
              <p className="text-sm text-gray-500">Add some delicious pickles!</p>
              <Button onClick={closeCart} asChild className="bg-brand-700 hover:bg-brand-800">
                <Link to="/products">Shop Now</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item._id} className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-brand-100 shrink-0">
                    <img
                      src={item.image || '/placeholder.jpg'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 leading-tight line-clamp-2">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.variantLabel}</p>
                    <p className="text-sm font-semibold text-brand-700 mt-1">₹{item.price}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => removeItem(item._id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1 border border-brand-200 rounded-md">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-7 h-7 flex items-center justify-center hover:bg-brand-50 disabled:opacity-40 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-brand-50 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with totals */}
        {items.length > 0 && (
          <div className="border-t border-brand-100 px-4 py-4 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>₹{totals.subtotal}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span><span>-₹{totals.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{totals.shippingCharge === 0 ? <span className="text-green-600">FREE</span> : `₹${totals.shippingCharge}`}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (5% GST)</span><span>₹{totals.tax}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-brand-800">
              <span className="font-display text-lg">Total</span>
              <span className="text-lg">₹{totals.total}</span>
            </div>
            {totals.shippingCharge > 0 && (
              <p className="text-xs text-center text-gray-400">
                Add ₹{499 - totals.subtotal} more for free shipping
              </p>
            )}
            <Button
              className="w-full bg-brand-700 hover:bg-brand-800 text-white font-semibold py-5"
              asChild
              onClick={closeCart}
            >
              <Link to="/checkout">Proceed to Checkout</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}