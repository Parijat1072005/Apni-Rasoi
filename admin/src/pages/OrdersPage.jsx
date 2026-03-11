import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Eye, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import DataTable from '../components/common/DataTable.jsx';
import Pagination from '../components/common/Pagination.jsx';
import { orderService } from '../services/index.js';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  refunded:   'bg-gray-100 text-gray-600',
};

const NEXT_STATUSES = {
  pending:    ['confirmed', 'cancelled'],
  confirmed:  ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped:    ['delivered'],
  delivered:  ['refunded'],
};

function OrderDetailModal({ order, onClose }) {
  const queryClient = useQueryClient();
  const [status,   setStatus]   = useState('');
  const [note,     setNote]     = useState('');
  const [tracking, setTracking] = useState('');

  const mutation = useMutation({
    mutationFn: () => orderService.updateStatus(order._id, {
      status, note: note || undefined,
      trackingNumber: tracking || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders']);
      toast.success('Order status updated');
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const nextStatuses = NEXT_STATUSES[order.status] || [];

  return (
    <div className="space-y-5 max-h-[80vh] overflow-y-auto pr-1">
      {/* Order Info */}
      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500 mb-0.5">Order Number</p>
          <p className="font-mono font-semibold text-gray-800">{order.orderNumber}</p>
        </div>
        <div>
          <p className="text-gray-500 mb-0.5">Date</p>
          <p className="font-medium">{format(new Date(order.createdAt), 'd MMM yyyy, h:mm a')}</p>
        </div>
        <div>
          <p className="text-gray-500 mb-0.5">Customer</p>
          <p className="font-medium">{order.user?.name}</p>
          <p className="text-gray-400 text-xs">{order.user?.email}</p>
        </div>
        <div>
          <p className="text-gray-500 mb-0.5">Current Status</p>
          <Badge className={`${STATUS_COLORS[order.status]} border-0 capitalize`}>{order.status}</Badge>
        </div>
      </div>

      <Separator />

      {/* Items */}
      <div>
        <p className="font-semibold text-sm text-gray-800 mb-3">Items ({order.items?.length})</p>
        <div className="space-y-2">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-2.5">
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-gray-500">{item.variantLabel} × {item.quantity}</p>
              </div>
              <p className="font-semibold text-sm text-brand-800">₹{item.price * item.quantity}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-sm">
        <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{order.pricing?.subtotal}</span></div>
        {order.pricing?.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{order.pricing.discount}</span></div>}
        <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.pricing?.shippingCharge === 0 ? 'FREE' : `₹${order.pricing?.shippingCharge}`}</span></div>
        <div className="flex justify-between text-gray-600"><span>GST</span><span>₹{order.pricing?.tax}</span></div>
        <Separator />
        <div className="flex justify-between font-bold text-gray-900"><span>Total</span><span>₹{order.pricing?.total}</span></div>
      </div>

      {/* Shipping Address */}
      <div className="text-sm">
        <p className="font-semibold text-gray-800 mb-1">Shipping Address</p>
        <p className="text-gray-600">
          {order.shippingAddress?.fullName}, {order.shippingAddress?.phone}<br />
          {order.shippingAddress?.line1}, {order.shippingAddress?.city},<br />
          {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
        </p>
      </div>

      {/* Update Status */}
      {nextStatuses.length > 0 && (
        <div className="border border-brand-100 rounded-xl p-4 space-y-3">
          <p className="font-semibold text-sm text-gray-800">Update Status</p>
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((s) => (
              <button key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all capitalize
                  ${status === s ? 'bg-brand-700 text-white border-brand-700' : 'border-gray-200 text-gray-600 hover:border-brand-300'}`}>
                {s}
              </button>
            ))}
          </div>
          {status === 'shipped' && (
            <div className="space-y-1.5">
              <Label className="text-xs">Tracking Number</Label>
              <Input value={tracking} onChange={(e) => setTracking(e.target.value)}
                placeholder="AWB12345678" className="h-9 text-sm" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">Note (optional)</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about this status change" className="h-9 text-sm" />
          </div>
          <Button onClick={() => mutation.mutate()} disabled={!status || mutation.isLoading}
            className="bg-brand-700 hover:bg-brand-800 text-white w-full">
            {mutation.isLoading ? 'Updating...' : `Mark as ${status || '...'}`}
          </Button>
        </div>
      )}

      {/* Status History */}
      {order.statusHistory?.length > 0 && (
        <div>
          <p className="font-semibold text-sm text-gray-800 mb-3">Status History</p>
          <div className="space-y-2">
            {[...order.statusHistory].reverse().map((h, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <Badge className={`${STATUS_COLORS[h.status]} border-0 capitalize shrink-0`}>{h.status}</Badge>
                <div>
                  <p className="text-gray-500">{format(new Date(h.timestamp), 'd MMM yyyy, h:mm a')}</p>
                  {h.note && <p className="text-gray-600">{h.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const [page,      setPage]      = useState(1);
  const [search,    setSearch]    = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected,  setSelected]  = useState(null);

  const { data, isLoading } = useQuery({
  queryKey: ['admin-orders', page, search, statusFilter],
  queryFn:  () => orderService.getAll({ page, limit: 15, search: search || undefined, status: statusFilter || undefined }),
  select:   (d) => ({
    data:       d.data?.data       ?? [],
    pagination: d.data?.pagination ?? {},
  }),
  keepPreviousData: true,
});

  const columns = [
    {
      key: 'orderNumber', label: 'Order #',
      render: (v) => <span className="font-mono text-xs font-semibold text-gray-700">{v}</span>,
    },
    {
      key: 'user', label: 'Customer',
      render: (user) => (
        <div>
          <p className="font-medium text-sm text-gray-800">{user?.name}</p>
          <p className="text-xs text-gray-400">{user?.email}</p>
        </div>
      ),
    },
    {
      key: 'pricing', label: 'Amount',
      render: (pricing) => <span className="font-semibold text-brand-800">₹{pricing?.total}</span>,
    },
    {
      key: 'payment', label: 'Payment',
      render: (payment) => (
        <div>
          <Badge className={`${payment?.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} border-0 text-xs capitalize`}>
            {payment?.status}
          </Badge>
          <p className="text-xs text-gray-400 mt-0.5 capitalize">{payment?.method === 'cod' ? 'COD' : 'Online'}</p>
        </div>
      ),
    },
    {
      key: 'status', label: 'Status',
      render: (status) => (
        <Badge className={`${STATUS_COLORS[status] || ''} border-0 capitalize`}>{status}</Badge>
      ),
    },
    {
      key: 'createdAt', label: 'Date',
      render: (v) => <span className="text-xs text-gray-500">{format(new Date(v), 'd MMM yy')}</span>,
    },
    {
      key: '_id', label: '',
      render: (_, row) => (
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-brand-50"
          onClick={() => setSelected(row)}>
          <Eye className="w-4 h-4 text-brand-600" />
        </Button>
      ),
    },
  ];

  const STATUS_OPTIONS = ['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-gray-900">Orders</h1>
        <p className="text-gray-400 text-sm mt-0.5">{data?.pagination?.total || 0} total orders</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search order number..."
            className="pl-9 border-gray-200 h-9 w-52" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.filter(Boolean).map((s) => (
            <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} />
      <Pagination page={page} totalPages={data?.pagination?.pages || 1} onPageChange={setPage} />

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Order Details</DialogTitle>
          </DialogHeader>
          {selected && <OrderDetailModal order={selected} onClose={() => setSelected(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}