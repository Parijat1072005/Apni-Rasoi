import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, MapPin, CreditCard, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { orderService } from '../services/orderService.js';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending:'bg-yellow-100 text-yellow-700', confirmed:'bg-blue-100 text-blue-700',
  processing:'bg-purple-100 text-purple-700', shipped:'bg-indigo-100 text-indigo-700',
  delivered:'bg-green-100 text-green-700', cancelled:'bg-red-100 text-red-700', refunded:'bg-gray-100 text-gray-700',
};
const STATUS_STEPS = ['pending','confirmed','processing','shipped','delivered'];

export default function OrderDetailPage() {
  const { id }         = useParams();
  const queryClient    = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn:  () => orderService.getById(id),
    select:   (d) => d.data.data.order,
  });

  const cancelMutation = useMutation({
    mutationFn: () => orderService.cancelOrder(id, { reason: 'Cancelled by customer' }),
    onSuccess: () => {
      toast.success('Order cancelled');
      queryClient.invalidateQueries(['order', id]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not cancel'),
  });

  if (isLoading) return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
      {[1,2,3].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
    </div>
  );

  if (!order) return <div className="text-center py-20 text-gray-500">Order not found</div>;

  const currentStep = STATUS_STEPS.indexOf(order.status);
  const canCancel   = ['pending','confirmed'].includes(order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-brand-900">{order.orderNumber}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Badge className={`${STATUS_COLORS[order.status] || ''} border-0 capitalize text-sm`}>
            {order.status}
          </Badge>
          {canCancel && (
            <Button size="sm" variant="destructive" onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isLoading}>
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* Progress Tracker */}
      {order.status !== 'cancelled' && order.status !== 'refunded' && (
        <div className="bg-white rounded-2xl border border-brand-100 p-6 mb-5">
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 right-0 top-4 h-1 bg-brand-100">
              <div className="h-full bg-brand-700 transition-all duration-500"
                style={{ width: `${Math.max(0, currentStep / (STATUS_STEPS.length - 1)) * 100}%` }} />
            </div>
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-2 relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                  ${i <= currentStep ? 'bg-brand-700 border-brand-700 text-white' : 'bg-white border-brand-200 text-gray-400'}`}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <p className={`text-xs capitalize hidden sm:block ${i <= currentStep ? 'text-brand-700 font-medium' : 'text-gray-400'}`}>
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-white rounded-2xl border border-brand-100 p-5 mb-5">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-brand-600" /> Items Ordered
        </h2>
        <div className="space-y-4">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden border border-brand-100 shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</p>
                <p className="text-xs text-gray-500">{item.variantLabel} × {item.quantity}</p>
              </div>
              <p className="font-semibold text-brand-800 shrink-0">₹{item.price * item.quantity}</p>
            </div>
          ))}
        </div>
        <Separator className="my-4" />
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{order.pricing?.subtotal}</span></div>
          {order.pricing?.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{order.pricing.discount}</span></div>}
          <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.pricing?.shippingCharge === 0 ? 'FREE' : `₹${order.pricing?.shippingCharge}`}</span></div>
          <div className="flex justify-between text-gray-600"><span>GST</span><span>₹{order.pricing?.tax}</span></div>
          <Separator />
          <div className="flex justify-between font-bold text-brand-900 text-base">
            <span>Total</span><span>₹{order.pricing?.total}</span>
          </div>
        </div>
      </div>

      {/* Shipping & Payment */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-brand-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-600" /> Shipping Address
          </h2>
          <div className="text-sm text-gray-600 space-y-0.5">
            <p className="font-medium text-gray-800">{order.shippingAddress?.fullName}</p>
            <p>{order.shippingAddress?.phone}</p>
            <p>{order.shippingAddress?.line1}</p>
            {order.shippingAddress?.line2 && <p>{order.shippingAddress.line2}</p>}
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-brand-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-brand-600" /> Payment
          </h2>
          <div className="text-sm text-gray-600 space-y-1.5">
            <div className="flex justify-between">
              <span>Method</span>
              <span className="capitalize font-medium text-gray-800">{order.payment?.method === 'cod' ? 'Cash on Delivery' : 'Online'}</span>
            </div>
            <div className="flex justify-between">
              <span>Status</span>
              <Badge className={`${order.payment?.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} border-0 text-xs capitalize`}>
                {order.payment?.status}
              </Badge>
            </div>
            {order.shipping?.trackingNumber && (
              <div className="flex justify-between">
                <span>Tracking</span>
                <span className="font-mono text-xs">{order.shipping.trackingNumber}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link to="/orders" className="text-brand-600 hover:text-brand-800 text-sm font-medium transition-colors">
          ← Back to My Orders
        </Link>
      </div>
    </div>
  );
}