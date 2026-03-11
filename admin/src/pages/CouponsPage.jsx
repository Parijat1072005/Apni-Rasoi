import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import DataTable from '../components/common/DataTable.jsx';
import Pagination from '../components/common/Pagination.jsx';
import { couponService } from '../services/index.js';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function CouponForm({ coupon, onClose }) {
  const queryClient = useQueryClient();
  const isEdit = !!coupon;
  const { register, handleSubmit, watch } = useForm({
    defaultValues: coupon ? {
      ...coupon,
      validFrom:   coupon.validFrom?.slice(0, 10),
      validUntil:  coupon.validUntil?.slice(0, 10),
    } : { type: 'percentage', isActive: true, perUserLimit: 1, minOrderAmount: 0 },
  });
  const couponType = watch('type');

  const mutation = useMutation({
    mutationFn: (data) => isEdit
      ? couponService.update(coupon._id, data)
      : couponService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-coupons']);
      toast.success(isEdit ? 'Coupon updated!' : 'Coupon created!');
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const onSubmit = (data) => {
    mutation.mutate({
      ...data,
      value:          Number(data.value),
      maxDiscount:    data.maxDiscount ? Number(data.maxDiscount) : null,
      minOrderAmount: Number(data.minOrderAmount),
      usageLimit:     data.usageLimit  ? Number(data.usageLimit)  : null,
      perUserLimit:   Number(data.perUserLimit),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Coupon Code *</Label>
          <Input {...register('code', { required: true })} placeholder="HOLI2024" className="h-10 uppercase" />
        </div>
        <div className="space-y-1.5">
          <Label>Type *</Label>
          <select {...register('type')}
            className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="percentage">Percentage (%)</option>
            <option value="flat">Flat Amount (₹)</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>{couponType === 'percentage' ? 'Discount %' : 'Discount ₹'} *</Label>
          <Input type="number" {...register('value', { required: true })} placeholder={couponType === 'percentage' ? '10' : '100'} className="h-10" />
        </div>
        {couponType === 'percentage' && (
          <div className="space-y-1.5">
            <Label>Max Discount (₹)</Label>
            <Input type="number" {...register('maxDiscount')} placeholder="500" className="h-10" />
          </div>
        )}
        <div className="space-y-1.5">
          <Label>Min Order Amount (₹)</Label>
          <Input type="number" {...register('minOrderAmount')} placeholder="0" className="h-10" />
        </div>
        <div className="space-y-1.5">
          <Label>Usage Limit (total)</Label>
          <Input type="number" {...register('usageLimit')} placeholder="Unlimited" className="h-10" />
        </div>
        <div className="space-y-1.5">
          <Label>Per User Limit</Label>
          <Input type="number" {...register('perUserLimit')} placeholder="1" className="h-10" />
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Input {...register('description')} placeholder="e.g. Holi Special 10% off" className="h-10" />
        </div>
        <div className="space-y-1.5">
          <Label>Valid From *</Label>
          <Input type="date" {...register('validFrom', { required: true })} className="h-10" />
        </div>
        <div className="space-y-1.5">
          <Label>Valid Until *</Label>
          <Input type="date" {...register('validUntil', { required: true })} className="h-10" />
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" className="accent-brand-700" {...register('isActive')} />
        <span className="text-sm text-gray-700">Active</span>
      </label>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={mutation.isLoading} className="bg-brand-700 hover:bg-brand-800 text-white">
          {mutation.isLoading ? 'Saving...' : isEdit ? 'Update' : 'Create Coupon'}
        </Button>
      </div>
    </form>
  );
}

export default function CouponsPage() {
  const queryClient = useQueryClient();
  const [page, setPage]     = useState(1);
  const [dialog, setDialog] = useState(null);

  const { data, isLoading } = useQuery({
  queryKey: ['admin-coupons', page],
  queryFn:  () => couponService.getAll({ page, limit: 15 }),
  select:   (d) => ({
    data:       d.data?.data       ?? [],
    pagination: d.data?.pagination ?? {},
  }),
  keepPreviousData: true,
});

  const deleteMutation = useMutation({
    mutationFn: (id) => couponService.delete(id),
    onSuccess:  () => { queryClient.invalidateQueries(['admin-coupons']); toast.success('Coupon deleted'); },
    onError:    () => toast.error('Delete failed'),
  });

  const columns = [
    {
      key: 'code', label: 'Code',
      render: (code) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-brand-700">{code}</span>
          <button onClick={() => { navigator.clipboard.writeText(code); toast.success('Copied!'); }}
            className="text-gray-300 hover:text-brand-500 transition-colors">
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
    {
      key: 'type', label: 'Discount',
      render: (type, row) => (
        <span className="font-semibold text-gray-800">
          {type === 'percentage' ? `${row.value}%` : `₹${row.value}`}
          {type === 'percentage' && row.maxDiscount ? ` (max ₹${row.maxDiscount})` : ''}
        </span>
      ),
    },
    {
      key: 'minOrderAmount', label: 'Min Order',
      render: (v) => v > 0 ? `₹${v}` : 'None',
    },
    {
      key: 'usedCount', label: 'Usage',
      render: (used, row) => (
        <span className="text-sm text-gray-600">
          {used} / {row.usageLimit || '∞'}
        </span>
      ),
    },
    {
      key: 'validUntil', label: 'Expires',
      render: (v) => {
        const expired = new Date(v) < new Date();
        return <span className={`text-xs ${expired ? 'text-red-500' : 'text-gray-500'}`}>{format(new Date(v), 'd MMM yyyy')}</span>;
      },
    },
    {
      key: 'isActive', label: 'Status',
      render: (v, row) => {
        const expired = new Date(row.validUntil) < new Date();
        return (
          <Badge className={(!v || expired) ? 'bg-red-100 text-red-600 border-0' : 'bg-green-100 text-green-700 border-0'}>
            {!v ? 'Inactive' : expired ? 'Expired' : 'Active'}
          </Badge>
        );
      },
    },
    {
      key: '_id', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-brand-50" onClick={() => setDialog(row)}>
            <Pencil className="w-3.5 h-3.5 text-brand-600" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-red-50"
            onClick={() => { if (confirm('Delete this coupon?')) deleteMutation.mutate(row._id); }}>
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-gray-900">Coupons</h1>
          <p className="text-gray-400 text-sm mt-0.5">{data?.pagination?.total || 0} coupons</p>
        </div>
        <Button onClick={() => setDialog('create')} className="bg-brand-700 hover:bg-brand-800 text-white gap-2">
          <Plus className="w-4 h-4" /> Create Coupon
        </Button>
      </div>
      <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} />
      <Pagination page={page} totalPages={data?.pagination?.pages || 1} onPageChange={setPage} />
      <Dialog open={!!dialog} onOpenChange={() => setDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              {dialog === 'create' ? 'Create Coupon' : 'Edit Coupon'}
            </DialogTitle>
          </DialogHeader>
          {dialog && <CouponForm coupon={dialog === 'create' ? null : dialog} onClose={() => setDialog(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}