import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import useCartStore from '../store/cartStore.js';
import useAuthStore from '../store/authStore.js';
import { orderService } from '../services/orderService.js';
import toast from 'react-hot-toast';

const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit phone required'),
  line1: z.string().min(5, 'Address required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  pincode: z.string().regex(/^\d{6}$/, 'Valid 6-digit pincode required'),
});

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh',
  'Jammu and Kashmir',
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const cart = useCartStore((s) => s.cart);
  const rawTotals = useCartStore((s) => s.totals);
  const totals = {
    subtotal: rawTotals?.subtotal ?? 0,
    discount: rawTotals?.discount ?? 0,
    shippingCharge: rawTotals?.shippingCharge ?? 0,
    tax: rawTotals?.tax ?? 0,
    total: rawTotals?.total ?? 0,
  };
  const isLoading = useCartStore((s) => s.isLoading);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const clearLocal = useCartStore((s) => s.clearLocal);

  const [payMethod, setPayMethod] = useState('razorpay');
  const [placing, setPlacing] = useState(false);
  const [cartReady, setCartReady] = useState(false);
  const items = cart?.items || [];

  // ── Sync cart from server on mount ───────────────────────────────────────
  useEffect(() => {
    fetchCart().finally(() => setCartReady(true));
  }, []);

  // Redirect AFTER render — never during
  useEffect(() => {
    if (cartReady && items.length === 0) {
      navigate('/cart');
    }
  }, [cartReady, items.length]);

  const savedAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: savedAddress
      ? {
        fullName: savedAddress.fullName || '',
        phone: savedAddress.phone || '',
        line1: savedAddress.line1 || '',
        line2: savedAddress.line2 || '',
        city: savedAddress.city || '',
        state: savedAddress.state || '',
        pincode: savedAddress.pincode || '',
      }
      : { fullName: user?.name || '', phone: user?.phone || '' },
  });

  

  if (!cartReady) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <Skeleton className="h-9 w-48 mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-36 rounded-2xl" />
          </div>
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }
  const safeTotal = totals.total > 0
    ? totals.total
    : items.reduce((s, i) => s + (i.price * i.quantity), 0);



  // ── Place order handler ───────────────────────────────────────────────────
  const handlePlaceOrder = async (shippingAddress) => {
    setPlacing(true);
    try {
      if (payMethod === 'cod') {
        const res = await orderService.placeOrder({
          shippingAddress,
          paymentMethod: 'cod',
        });
        // Handle both possible response shapes
        const order = res.data?.data?.order || res.data?.order;
        if (!order?._id) throw new Error('Order ID missing in response');
        clearLocal();
        toast.success('Order placed successfully!');
        navigate(`/orders/${order._id}`);
        return;
      }

      // ── Razorpay flow ─────────────────────────────────────────────────────
      const rzpRes = await orderService.createRazorpayOrder();
      const { razorpayOrderId, amount, currency, keyId } =
        rzpRes.data?.data || rzpRes.data;

      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: 'Apni Rasoi',
        description: 'Pickle & Seasonal Foods',
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || '',
        },
        theme: { color: '#15803d' },
        handler: async (response) => {
          try {
            const res = await orderService.placeOrder({
              shippingAddress,
              paymentMethod: 'razorpay',
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            const order = res.data?.data?.order || res.data?.order;
            if (!order?._id) throw new Error('Order ID missing');
            clearLocal();
            toast.success('Payment successful! Order placed.');
            navigate(`/orders/${order._id}`);
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            toast('Payment cancelled');
            setPlacing(false);
          },
        },
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Something went wrong');
      setPlacing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl text-brand-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(handlePlaceOrder)}>
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Left col ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl border border-brand-100 p-6">
              <h2 className="font-display text-xl text-brand-900 mb-5 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-600" /> Shipping Address
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { id: 'fullName', label: 'Full Name', span: 1 },
                  { id: 'phone', label: 'Phone Number', span: 1 },
                  { id: 'line1', label: 'Address Line 1', span: 2 },
                  { id: 'line2', label: 'Address Line 2 (Optional)', span: 2 },
                  { id: 'city', label: 'City', span: 1 },
                  { id: 'pincode', label: 'Pincode', span: 1 },
                ].map(({ id, label, span }) => (
                  <div key={id} className={cn('space-y-1.5', span === 2 && 'sm:col-span-2')}>
                    <Label className="text-sm font-medium text-gray-700">{label}</Label>
                    <Input {...register(id)} className="border-brand-200 h-10" />
                    {errors[id] && <p className="text-xs text-red-500">{errors[id].message}</p>}
                  </div>
                ))}

                {/* State dropdown */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">State</Label>
                  <select
                    {...register('state')}
                    className="w-full h-10 px-3 rounded-lg border border-brand-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.state && <p className="text-xs text-red-500">{errors.state.message}</p>}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl border border-brand-100 p-6">
              <h2 className="font-display text-xl text-brand-900 mb-5 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-600" /> Payment Method
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { value: 'razorpay', label: 'Pay Online', desc: 'UPI, Cards, Net Banking', icon: '💳' },
                  { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive', icon: '💵' },
                ].map((m) => (
                  <label key={m.value} className={cn(
                    'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                    payMethod === m.value
                      ? 'border-brand-700 bg-brand-50'
                      : 'border-gray-200 hover:border-brand-300'
                  )}>
                    <input
                      type="radio" name="payMethod" value={m.value}
                      checked={payMethod === m.value}
                      onChange={(e) => setPayMethod(e.target.value)}
                      className="accent-brand-700"
                    />
                    <div>
                      <span className="text-xl mr-1">{m.icon}</span>
                      <p className="font-semibold text-sm text-gray-800">{m.label}</p>
                      <p className="text-xs text-gray-500">{m.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ── Order Summary ── */}
          <div>
            <div className="bg-white rounded-2xl border border-brand-100 p-5 sticky top-24">
              <p className="font-display text-lg text-brand-900 mb-4">Order Summary</p>

              <div className="space-y-3 mb-4 max-h-52 overflow-y-auto">
                {items.map((item, idx) => (
                  <div key={item._id || idx} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-brand-100 shrink-0 bg-brand-50">
                      {item.image
                        ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        : <span className="flex items-center justify-center h-full text-lg">🫙</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.variantLabel} × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-brand-800 shrink-0">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 mt-3 text-sm">
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
                  <span>
                    {totals.shippingCharge === 0
                      ? <span className="text-green-600">FREE</span>
                      : `₹${totals.shippingCharge}`
                    }
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (5%)</span><span>₹{totals.tax}</span>
                </div>
              </div>

              <Separator className="my-3" />

              <div className="flex justify-between font-bold text-brand-900 mb-5">
                <span className="font-display text-lg">Total</span>
                <span className="text-xl">₹{totals.total}</span>
              </div>

              <Button
                type="submit"
                disabled={placing}
                className="w-full bg-brand-700 hover:bg-brand-800 text-white font-bold py-5 text-base">
                {placing
                  ? 'Processing...'
                  : payMethod === 'cod'
                    ? 'Place Order'
                    : `Pay ₹${safeTotal}`
                }
              </Button>

              <p className="text-xs text-center text-gray-400 mt-3">
                🔒 Secured by 256-bit SSL encryption
              </p>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}
