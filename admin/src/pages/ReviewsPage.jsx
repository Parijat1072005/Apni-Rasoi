import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DataTable from '../components/common/DataTable.jsx';
import Pagination from '../components/common/Pagination.jsx';
import { reviewService } from '../services/index.js';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STARS = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

export default function ReviewsPage() {
  const queryClient = useQueryClient();
  const [page,   setPage]   = useState(1);
  const [filter, setFilter] = useState('pending');

  const { data, isLoading } = useQuery({
  queryKey: ['admin-reviews', page, filter],
  queryFn:  () => reviewService.getAll({
    page, limit: 15,
    isApproved: filter === 'all' ? undefined : filter === 'approved' ? 'true' : 'false',
  }),
  select:   (d) => ({
    data:       d.data?.data       ?? [],
    pagination: d.data?.pagination ?? {},
  }),
  keepPreviousData: true,
});

  const statusMutation = useMutation({
    mutationFn: ({ id, isApproved }) => reviewService.updateStatus(id, isApproved),
    onSuccess:  (_, { isApproved }) => {
      queryClient.invalidateQueries(['admin-reviews']);
      toast.success(isApproved ? 'Review approved' : 'Review rejected');
    },
    onError: () => toast.error('Action failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => reviewService.delete(id),
    onSuccess:  () => { queryClient.invalidateQueries(['admin-reviews']); toast.success('Review deleted'); },
    onError:    () => toast.error('Delete failed'),
  });

  const columns = [
    {
      key: 'product', label: 'Product',
      render: (product) => <span className="font-medium text-sm text-gray-700 max-w-[120px] truncate block">{product?.name || '—'}</span>,
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
      key: 'rating', label: 'Rating',
      render: (v) => <span className="text-yellow-500 text-sm">{STARS(v)}</span>,
    },
    {
      key: 'comment', label: 'Review',
      render: (v, row) => (
        <div className="max-w-xs">
          {row.title && <p className="font-semibold text-xs text-gray-700">{row.title}</p>}
          <p className="text-xs text-gray-500 line-clamp-2">{v || '—'}</p>
        </div>
      ),
    },
    {
      key: 'isApproved', label: 'Status',
      render: (v) => (
        <Badge className={v ? 'bg-green-100 text-green-700 border-0' : 'bg-yellow-100 text-yellow-700 border-0'}>
          {v ? 'Approved' : 'Pending'}
        </Badge>
      ),
    },
    {
      key: 'createdAt', label: 'Date',
      render: (v) => <span className="text-xs text-gray-400">{format(new Date(v), 'd MMM yy')}</span>,
    },
    {
      key: '_id', label: 'Actions',
      render: (id, row) => (
        <div className="flex items-center gap-1.5">
          {!row.isApproved && (
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-green-50"
              onClick={() => statusMutation.mutate({ id, isApproved: true })}>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </Button>
          )}
          {row.isApproved && (
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-orange-50"
              onClick={() => statusMutation.mutate({ id, isApproved: false })}>
              <XCircle className="w-4 h-4 text-orange-500" />
            </Button>
          )}
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-red-50"
            onClick={() => { if (confirm('Delete this review?')) deleteMutation.mutate(id); }}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-gray-900">Reviews</h1>
        <p className="text-gray-400 text-sm mt-0.5">{data?.pagination?.total || 0} reviews</p>
      </div>

      <Tabs value={filter} onValueChange={(v) => { setFilter(v); setPage(1); }}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="pending"  className="data-[state=active]:bg-white text-xs">Pending Approval</TabsTrigger>
          <TabsTrigger value="approved" className="data-[state=active]:bg-white text-xs">Approved</TabsTrigger>
          <TabsTrigger value="all"      className="data-[state=active]:bg-white text-xs">All</TabsTrigger>
        </TabsList>
      </Tabs>

      <DataTable columns={columns} data={data?.data || []} isLoading={isLoading}
        emptyMessage={filter === 'pending' ? 'No reviews pending approval' : 'No reviews found'} />
      <Pagination page={page} totalPages={data?.pagination?.pages || 1} onPageChange={setPage} />
    </div>
  );
}