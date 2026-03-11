import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import DataTable from '../components/common/DataTable.jsx';
import { categoryService } from '../services/index.js';
import toast from 'react-hot-toast';

function CategoryForm({ category, categories, onClose }) {
  const queryClient = useQueryClient();
  const isEdit = !!category;
  const { register, handleSubmit } = useForm({
    defaultValues: category ? {
      name:         category.name,
      description:  category.description || '',
      isSeasonal:   category.isSeasonal,
      seasonMonths: category.seasonMonths?.join(', ') || '',
      sortOrder:    category.sortOrder || 0,
      isActive:     category.isActive ?? true,
    } : { isActive: true, sortOrder: 0 },
  });

  const mutation = useMutation({
    mutationFn: (data) => isEdit
      ? categoryService.update(category._id, data)
      : categoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success(isEdit ? 'Category updated!' : 'Category created!');
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const onSubmit = (data) => {
    mutation.mutate({
      ...data,
      sortOrder:    Number(data.sortOrder),
      seasonMonths: data.seasonMonths
        ? data.seasonMonths.split(',').map((m) => Number(m.trim())).filter(Boolean)
        : [],
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Category Name *</Label>
        <Input {...register('name', { required: true })} placeholder="e.g. Mango Pickles" className="h-10" />
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <textarea {...register('description')} rows={2} placeholder="Short description"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Sort Order</Label>
          <Input type="number" {...register('sortOrder')} className="h-10" />
        </div>
        <div className="flex flex-col justify-end gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="accent-brand-700" {...register('isSeasonal')} />
            <span className="text-sm text-gray-700">Seasonal Category</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="accent-brand-700" {...register('isActive')} />
            <span className="text-sm text-gray-700">Active</span>
          </label>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Season Months (comma separated, 1–12)</Label>
        <Input {...register('seasonMonths')} placeholder="e.g. 3, 4 for March & April (Holi)" className="h-10" />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={mutation.isLoading} className="bg-brand-700 hover:bg-brand-800 text-white">
          {mutation.isLoading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn:  () => categoryService.getAll({ includeInactive: true }),
    select:   (d) => d.data.data.categories,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => categoryService.delete(id),
    onSuccess:  () => { queryClient.invalidateQueries(['categories']); toast.success('Category deleted'); },
    onError:    () => toast.error('Delete failed'),
  });

  const columns = [
    {
      key: 'image', label: 'Image',
      render: (image) => (
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-brand-50 border border-brand-100">
          {image?.url ? <img src={image.url} alt="" className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full text-lg">🫙</span>}
        </div>
      ),
    },
    {
      key: 'name', label: 'Name',
      render: (name, row) => (
        <div>
          <p className="font-medium text-gray-800">{name}</p>
          <p className="text-xs text-gray-400">{row.slug}</p>
        </div>
      ),
    },
    {
      key: 'isSeasonal', label: 'Type',
      render: (v, row) => v
        ? <Badge className="bg-purple-100 text-purple-700 border-0">Seasonal</Badge>
        : <Badge className="bg-gray-100 text-gray-600 border-0">Regular</Badge>,
    },
    {
      key: 'isActive', label: 'Status',
      render: (v) => v
        ? <Badge className="bg-green-100 text-green-700 border-0">Active</Badge>
        : <Badge className="bg-red-100 text-red-600 border-0">Hidden</Badge>,
    },
    { key: 'sortOrder', label: 'Order', render: (v) => <span className="text-sm text-gray-500">{v}</span> },
    {
      key: '_id', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-brand-50" onClick={() => setDialog(row)}>
            <Pencil className="w-3.5 h-3.5 text-brand-600" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-red-50"
            onClick={() => { if (confirm('Delete this category?')) deleteMutation.mutate(row._id); }}>
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
          <h1 className="font-display text-2xl text-gray-900">Categories</h1>
          <p className="text-gray-400 text-sm mt-0.5">{categories.length} categories</p>
        </div>
        <Button onClick={() => setDialog('create')} className="bg-brand-700 hover:bg-brand-800 text-white gap-2">
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>
      <DataTable columns={columns} data={categories} isLoading={isLoading} />
      <Dialog open={!!dialog} onOpenChange={() => setDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {dialog === 'create' ? 'New Category' : 'Edit Category'}
            </DialogTitle>
          </DialogHeader>
          {dialog && (
            <CategoryForm
              category={dialog === 'create' ? null : dialog}
              categories={categories}
              onClose={() => setDialog(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}