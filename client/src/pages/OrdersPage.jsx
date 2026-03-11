import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { orderService } from '../services/orderService.js';

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  refunded:   'bg-gray-100 text-gray-700',
};

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn:  () => orderService.getMyOrders({ limit: 20 }),
    select:   (d) => d.data.data,
  });

  if (isLoading) return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
      {[1,2,3].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
    </div>
  );

  const orders = data || [];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl text-brand-900 mb-8">My Orders</h1>

      {!orders.length ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-display text-xl text-brand-800 mb-2">No orders yet</h3>
          <p className="text-gray-500 text-sm mb-6">Your order history will appear here</p>
          <Button asChild className="bg-brand-700 hover:bg-brand-800">
            <Link to="/products">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order._id} to={`/orders/${order._id}`}
              className="block bg-white rounded-2xl border border-brand-100 hover:border-brand-300 hover:shadow-sm transition-all p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-semibold text-gray-800">{order.orderNumber}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`${STATUS_COLORS[order.status] || ''} border-0 capitalize`}>
                    {order.status}
                  </Badge>
                  <Badge className={`border-0 ${order.payment?.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {order.payment?.status}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                {order.items?.slice(0, 3).map((item, i) => (
                  <div key={i} className="w-10 h-10 rounded-lg overflow-hidden border border-brand-100 bg-brand-50 shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                ))}
                {order.items?.length > 3 && (
                  <span className="text-xs text-gray-500">+{order.items.length - 3} more</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{order.items?.length} item(s)</p>
                <p className="font-bold text-brand-800 text-base">₹{order.pricing?.total}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}