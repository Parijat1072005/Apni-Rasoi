import { useQuery } from '@tanstack/react-query';
import {
  IndianRupee, ShoppingCart, Users, Package,
  Clock, CheckCircle, TrendingUp, AlertTriangle,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { format } from 'date-fns';
import StatCard from '../components/common/StatCard.jsx';
import { dashboardService } from '../services/index.js';
import { Skeleton } from '@/components/ui/skeleton';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn:  () => dashboardService.getStats(),
    select:   (d) => d.data.data,
    refetchInterval: 60000,
  });

  const revenueChartData = (stats?.revenueByMonth || []).map((item) => ({
    month: MONTHS[(item._id?.month || 1) - 1],
    revenue: Math.round(item.revenue),
    orders:  item.orders,
  }));

  const topProductsData = (stats?.topProducts || []).map((p) => ({
    name: p.name?.length > 18 ? p.name.slice(0, 18) + '…' : p.name,
    sold: p.sold,
    revenue: Math.round(p.revenue),
  }));

  const STAT_CARDS = [
    { title: 'Total Revenue',     value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: IndianRupee,   color: 'green',  subtitle: 'All time paid orders' },
    { title: 'Total Orders',      value: stats?.totalOrders || 0,    icon: ShoppingCart,  color: 'blue',   subtitle: `${stats?.todayOrders || 0} today` },
    { title: 'Pending Orders',    value: stats?.pendingOrders || 0,  icon: Clock,         color: 'orange', subtitle: 'Needs attention' },
    { title: 'Delivered Orders',  value: stats?.deliveredOrders || 0,icon: CheckCircle,   color: 'green',  subtitle: 'Successfully completed' },
    { title: "This Month's Orders", value: stats?.monthOrders || 0,  icon: TrendingUp,    color: 'purple', subtitle: 'Current month' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          {format(new Date(), 'EEEE, d MMMM yyyy')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
          : STAT_CARDS.map((card) => <StatCard key={card.title} {...card} />)
        }
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="font-semibold text-gray-800 mb-1">Revenue (Last 6 Months)</p>
          <p className="text-xs text-gray-400 mb-5">Monthly revenue in ₹</p>
          {isLoading ? <Skeleton className="h-52" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#15803d" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#15803d" strokeWidth={2}
                  fill="url(#revenueGrad)" dot={{ fill: '#15803d', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="font-semibold text-gray-800 mb-1">Orders (Last 6 Months)</p>
          <p className="text-xs text-gray-400 mb-5">Monthly order volume</p>
          {isLoading ? <Skeleton className="h-52" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="orders" fill="#15803d" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="font-semibold text-gray-800 mb-1">Top Selling Products</p>
        <p className="text-xs text-gray-400 mb-5">By units sold</p>
        {isLoading ? <Skeleton className="h-48" /> : topProductsData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topProductsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="sold" fill="#16a34a" radius={[0, 6, 6, 0]} name="Units Sold" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
            No sales data yet. Add products and start selling!
          </div>
        )}
      </div>
    </div>
  );
}