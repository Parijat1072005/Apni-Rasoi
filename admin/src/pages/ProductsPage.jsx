import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useForm, useFieldArray } from 'react-hook-form';
import DataTable from '../components/common/DataTable.jsx';
import Pagination from '../components/common/Pagination.jsx';
import { productService, categoryService } from '../services/index.js';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Search, Package, ImagePlus, X as XIcon, Loader2 } from 'lucide-react';

function ProductForm({ product, categories, onClose }) {
    const queryClient = useQueryClient();
    const isEdit = !!product;
    const fileInputRef = useRef(null);

    // Image state — existing (from server) + new (base64 previews)
    const [existingImages, setExistingImages] = useState(
        product?.images || []
    );
    const [newImages, setNewImages] = useState([]); // { file, preview, base64 }
    const [imgUploading, setImgUploading] = useState(false);

    const { register, handleSubmit, control, formState: { errors } } = useForm({
        defaultValues: product ? {
            name: product.name,
            description: product.description,
            shortDescription: product.shortDescription || '',
            category: product.category?._id || product.category,
            tags: product.tags?.join(', ') || '',
            ingredients: product.ingredients?.join(', ') || '',
            isFeatured: product.isFeatured || false,
            isBestseller: product.isBestseller || false,
            isNewArrival: product.isNewArrival || false,
            isSeasonal: product.isSeasonal || false,
            variants: product.variants || [
                { label: '250g', weight: 250, price: 0, comparePrice: 0, stock: 0, sku: '' },
            ],
        } : {
            isFeatured: false, isBestseller: false, isNewArrival: false, isSeasonal: false,
            variants: [{ label: '250g', weight: 250, price: 0, comparePrice: 0, stock: 0, sku: '' }],
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'variants' });

    // ── Handle file selection ─────────────────────────────────────────────────
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const remaining = 6 - existingImages.length - newImages.length;
        const toAdd = files.slice(0, remaining);

        toAdd.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewImages((prev) => [
                    ...prev,
                    { file, preview: reader.result, base64: reader.result },
                ]);
            };
            reader.readAsDataURL(file);
        });

        // Reset input so same file can be re-selected
        e.target.value = '';
    };

    const removeExistingImage = (publicId) => {
        setExistingImages((prev) => prev.filter((img) => img.publicId !== publicId));
    };

    const removeNewImage = (index) => {
        setNewImages((prev) => prev.filter((_, i) => i !== index));
    };

    const totalImages = existingImages.length + newImages.length;
    const canAddMore = totalImages < 6;

    // ── Submit ────────────────────────────────────────────────────────────────
    const mutation = useMutation({
        mutationFn: (data) => isEdit
            ? productService.update(product._id, data)
            : productService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-products']);
            toast.success(isEdit ? 'Product updated!' : 'Product created!');
            onClose();
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
    });

    const onSubmit = async (data) => {
        setImgUploading(true);
        try {
            const base = {
                ...data,
                tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
                ingredients: data.ingredients ? data.ingredients.split(',').map((i) => i.trim()).filter(Boolean) : [],
                variants: data.variants.map((v) => ({
                    ...v,
                    weight: Number(v.weight),
                    price: Number(v.price),
                    comparePrice: Number(v.comparePrice),
                    stock: Number(v.stock),
                })),
            };

            if (isEdit) {
                // Only send new base64 images + list of publicIds to remove
                const removedIds = (product?.images || [])
                    .filter((orig) => !existingImages.find((e) => e.publicId === orig.publicId))
                    .map((img) => img.publicId);

                base.newImages = newImages.map((i) => i.base64);
                base.removeImageIds = removedIds;
                delete base.images;
            } else {
                // New product — send base64 array (can be empty, server handles it)
                base.images = newImages.map((i) => i.base64);
            }

            mutation.mutate(base);
        } finally {
            setImgUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-h-[78vh] overflow-y-auto pr-1">

            {/* ── Image Upload ──────────────────────────────────────────────────── */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <Label>Product Images <span className="text-gray-400 font-normal">({totalImages}/6)</span></Label>
                    {canAddMore && (
                        <button type="button" onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-1.5 text-xs text-brand-700 hover:text-brand-900 font-medium transition-colors">
                            <ImagePlus className="w-3.5 h-3.5" /> Add Images
                        </button>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                />

                {/* Image preview grid */}
                <div className="grid grid-cols-3 gap-3">
                    {/* Existing images */}
                    {existingImages.map((img) => (
                        <div key={img.publicId} className="relative aspect-square rounded-xl overflow-hidden border-2 border-brand-100 bg-brand-50 group">
                            <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={() => removeExistingImage(img.publicId)}
                                    className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                                    <XIcon className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            {existingImages.indexOf(img) === 0 && (
                                <div className="absolute top-1.5 left-1.5 bg-brand-700 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                                    Cover
                                </div>
                            )}
                        </div>
                    ))}

                    {/* New images */}
                    {newImages.map((img, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-blue-200 bg-blue-50 group">
                            <img src={img.preview} alt="New" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={() => removeNewImage(i)}
                                    className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                                    <XIcon className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="absolute top-1.5 right-1.5 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                                New
                            </div>
                        </div>
                    ))}

                    {/* Add more slot */}
                    {canAddMore && (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square rounded-xl border-2 border-dashed border-brand-200 bg-brand-50 hover:bg-brand-100 hover:border-brand-400 transition-colors flex flex-col items-center justify-center gap-2 text-brand-500">
                            <ImagePlus className="w-6 h-6" />
                            <span className="text-xs font-medium">Add Photo</span>
                        </button>
                    )}
                </div>

                <p className="text-xs text-gray-400 mt-2">
                    JPG, PNG or WebP. Max 6 images. First image is the cover photo.
                </p>
            </div>

            {/* ── Basic Info ────────────────────────────────────────────────────── */}
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                    <Label>Product Name *</Label>
                    <Input {...register('name', { required: 'Name is required' })}
                        placeholder="e.g. Classic Mango Achaar" className="h-10" />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label>Category *</Label>
                    <select {...register('category', { required: true })}
                        className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                        <option value="">Select Category</option>
                        {categories?.map((c) => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <Label>Short Description</Label>
                    <Input {...register('shortDescription')} placeholder="One-line summary" className="h-10" />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                    <Label>Full Description *</Label>
                    <textarea {...register('description', { required: 'Description is required' })}
                        rows={4} placeholder="Detailed product description..."
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
                    {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label>Tags <span className="text-gray-400 font-normal">(comma separated)</span></Label>
                    <Input {...register('tags')} placeholder="mango, achaar, spicy" className="h-10" />
                </div>

                <div className="space-y-1.5">
                    <Label>Ingredients <span className="text-gray-400 font-normal">(comma separated)</span></Label>
                    <Input {...register('ingredients')} placeholder="Mango, Salt, Mustard Oil" className="h-10" />
                </div>
            </div>

            {/* ── Flags ────────────────────────────────────────────────────────── */}
            <div className="flex flex-wrap gap-x-6 gap-y-2">
                {[
                    { id: 'isFeatured', label: '⭐ Featured' },
                    { id: 'isBestseller', label: '🔥 Bestseller' },
                    { id: 'isNewArrival', label: '✨ New Arrival' },
                    { id: 'isSeasonal', label: '🎊 Seasonal' },
                ].map(({ id, label }) => (
                    <label key={id} className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" className="accent-brand-700 w-4 h-4" {...register(id)} />
                        <span className="text-sm text-gray-700">{label}</span>
                    </label>
                ))}
            </div>

            {/* ── Variants ─────────────────────────────────────────────────────── */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <Label>Variants *</Label>
                    <Button type="button" size="sm" variant="outline"
                        onClick={() => append({ label: '', weight: 0, price: 0, comparePrice: 0, stock: 0, sku: '' })}
                        className="text-xs border-brand-200 text-brand-700 h-7 px-2">
                        + Add Variant
                    </Button>
                </div>

                {/* Column headers */}
                <div className="grid grid-cols-6 gap-2 mb-1 px-1">
                    {['Label', 'Weight(g)', 'Price(₹)', 'MRP(₹)', 'Stock', 'SKU'].map((h) => (
                        <p key={h} className="text-xs text-gray-400 font-medium">{h}</p>
                    ))}
                </div>

                <div className="space-y-2">
                    {fields.map((field, i) => (
                        <div key={field.id} className="grid grid-cols-6 gap-2 items-center bg-gray-50 rounded-xl p-3">
                            <Input {...register(`variants.${i}.label`)} placeholder="250g" className="h-8 text-xs" />
                            <Input {...register(`variants.${i}.weight`)} placeholder="250" type="number" min="0" className="h-8 text-xs" />
                            <Input {...register(`variants.${i}.price`)} placeholder="149" type="number" min="0" className="h-8 text-xs" />
                            <Input {...register(`variants.${i}.comparePrice`)} placeholder="199" type="number" min="0" className="h-8 text-xs" />
                            <Input {...register(`variants.${i}.stock`)} placeholder="50" type="number" min="0" className="h-8 text-xs" />
                            <div className="flex gap-1 items-center">
                                <Input {...register(`variants.${i}.sku`)} placeholder="SKU-001" className="h-8 text-xs flex-1 min-w-0" />
                                {fields.length > 1 && (
                                    <button type="button" onClick={() => remove(i)}
                                        className="text-red-400 hover:text-red-600 transition-colors shrink-0">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Footer buttons ────────────────────────────────────────────────── */}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 sticky bottom-0 bg-white pb-1">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={mutation.isLoading || imgUploading}
                    className="bg-brand-700 hover:bg-brand-800 text-white gap-2">
                    {(mutation.isLoading || imgUploading) && <Loader2 className="w-4 h-4 animate-spin" />}
                    {mutation.isLoading || imgUploading
                        ? 'Saving...'
                        : isEdit ? 'Update Product' : 'Create Product'}
                </Button>
            </div>
        </form>
    );
}

export default function ProductsPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [dialog, setDialog] = useState(null); // null | 'create' | product obj

    const { data, isLoading } = useQuery({
        queryKey: ['admin-products', page, search],
        queryFn: () => productService.getAll({ page, limit: 15, search: search || undefined }),
        select: (d) => ({
            data: d.data?.data ?? [],
            pagination: d.data?.pagination ?? {},
        }),
        keepPreviousData: true,
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoryService.getAll({ includeInactive: true }),
        select: (d) => d.data.data.categories,
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => productService.delete(id),
        onSuccess: () => { queryClient.invalidateQueries(['admin-products']); toast.success('Product deleted'); },
        onError: () => toast.error('Delete failed'),
    });

    const toggleActiveMutation = useMutation({
        mutationFn: ({ id, isActive }) => productService.update(id, { isActive }),
        onSuccess: () => queryClient.invalidateQueries(['admin-products']),
    });

    const columns = [
        {
            key: 'images', label: 'Image',
            render: (images) => (
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-brand-50 border border-brand-100">
                    {images?.[0]?.url
                        ? <img src={images[0].url} alt="" className="w-full h-full object-cover" />
                        : <Package className="w-5 h-5 m-2.5 text-gray-300" />}
                </div>
            ),
        },
        {
            key: 'name', label: 'Product',
            render: (name, row) => (
                <div>
                    <p className="font-medium text-gray-800 max-w-[180px] truncate">{name}</p>
                    <p className="text-xs text-gray-400">{row.category?.name}</p>
                </div>
            ),
        },
        { key: 'basePrice', label: 'Price', render: (v) => `₹${v}` },
        {
            key: 'variants', label: 'Stock',
            render: (variants) => {
                const total = variants?.reduce((s, v) => s + v.stock, 0) || 0;
                return <Badge className={total === 0 ? 'bg-red-100 text-red-600 border-0' : total <= 10 ? 'bg-orange-100 text-orange-600 border-0' : 'bg-green-100 text-green-700 border-0'}>{total} units</Badge>;
            },
        },
        {
            key: 'isActive', label: 'Status',
            render: (isActive, row) => (
                <button onClick={() => toggleActiveMutation.mutate({ id: row._id, isActive: !isActive })}>
                    <Badge className={isActive ? 'bg-green-100 text-green-700 border-0 cursor-pointer' : 'bg-gray-100 text-gray-600 border-0 cursor-pointer'}>
                        {isActive ? 'Active' : 'Hidden'}
                    </Badge>
                </button>
            ),
        },
        {
            key: '_id', label: 'Actions',
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-brand-50"
                        onClick={() => setDialog(row)}>
                        <Pencil className="w-3.5 h-3.5 text-brand-600" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-red-50"
                        onClick={() => { if (confirm('Delete this product?')) deleteMutation.mutate(row._id); }}>
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl text-gray-900">Products</h1>
                    <p className="text-gray-400 text-sm mt-0.5">{data?.pagination?.total || 0} total products</p>
                </div>
                <Button onClick={() => setDialog('create')} className="bg-brand-700 hover:bg-brand-800 text-white gap-2">
                    <Plus className="w-4 h-4" /> Add Product
                </Button>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search products..."
                    className="pl-9 border-gray-200 h-9" />
            </div>

            <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} />
            <Pagination page={page} totalPages={data?.pagination?.pages || 1} onPageChange={setPage} />

            <Dialog open={!!dialog} onOpenChange={() => setDialog(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="font-display">
                            {dialog === 'create' ? 'Add New Product' : 'Edit Product'}
                        </DialogTitle>
                    </DialogHeader>
                    {dialog && (
                        <ProductForm
                            product={dialog === 'create' ? null : dialog}
                            categories={categories}
                            onClose={() => setDialog(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}