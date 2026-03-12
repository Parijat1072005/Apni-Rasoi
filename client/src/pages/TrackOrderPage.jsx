import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useAuthStore from '../store/authStore.js';
import api from '../services/axios.js';
import toast from 'react-hot-toast';

export default function TrackOrderPage() {
  const navigate = useNavigate();
  const user     = useAuthStore((s) => s.user);
  const [query,   setQuery]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    const val = query.trim().toUpperCase();
    if (!val) return;
    setLoading(true);
    try {
      // Try looking up by orderNumber first
      const { data } = await api.get(`/orders/track/${val}`);
      const orderId = data?.data?.order?._id;
      if (orderId) {
        navigate(`/orders/${orderId}`);
      } else {
        toast.error('Order not found. Please check the number and try again.');
      }
    } catch {
      toast.error('Order not found. Please check the number and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cream min-h-screen">
      <section className="bg-gradient-to-br from-brand-950 to-brand-800 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="text-5xl mb-4">📦</div>
          <h1 className="font-display text-4xl font-bold mb-3">Track Your Order</h1>
          <p className="text-brand-200">
            Enter your Order Number from your confirmation email.
          </p>
        </div>
      </section>

      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-brand-100 p-8">
          <form onSubmit={handleTrack} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Order Number</Label>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. AR-20240315-0001"
                className="h-11 border-brand-200 uppercase"
              />
              <p className="text-xs text-gray-400">
                Your order number is in your confirmation email, e.g. <span className="font-mono font-semibold">AR-20240315-0001</span>
              </p>
            </div>
            <Button
              type="submit"
              disabled={!query.trim() || loading}
              className="w-full bg-brand-700 hover:bg-brand-800 text-white gap-2 py-5">
              <Search className="w-4 h-4" />
              {loading ? 'Searching...' : 'Track Order'}
            </Button>
          </form>

          {user && (
            <div className="mt-6 pt-6 border-t border-brand-50 text-center">
              <p className="text-sm text-gray-500 mb-3">
                Logged in? View all your orders directly
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/orders')}
                className="border-brand-200 text-brand-700 hover:bg-brand-50 gap-2">
                <Package className="w-4 h-4" /> My Orders
              </Button>
            </div>
          )}
        </div>

        <div className="mt-8 bg-brand-50 rounded-2xl border border-brand-100 p-5">
          <h3 className="font-semibold text-brand-900 mb-3 text-sm">📬 Order Status Guide</h3>
          <div className="space-y-2">
            {[
              { status: 'Pending',    desc: 'Order received, awaiting confirmation',  color: 'bg-yellow-100 text-yellow-700' },
              { status: 'Confirmed',  desc: 'Order confirmed, being prepared',         color: 'bg-blue-100   text-blue-700'   },
              { status: 'Processing', desc: 'Your pickle jar is being packed',          color: 'bg-purple-100 text-purple-700' },
              { status: 'Shipped',    desc: 'On its way to you',                        color: 'bg-orange-100 text-orange-700' },
              { status: 'Delivered',  desc: 'Delivered successfully. Enjoy! 🎉',        color: 'bg-green-100  text-green-700'  },
            ].map(({ status, desc, color }) => (
              <div key={status} className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${color}`}>
                  {status}
                </span>
                <span className="text-xs text-gray-600">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}