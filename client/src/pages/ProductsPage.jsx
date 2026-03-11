import { useState } from 'react';
// ── Add this at top of the file with other imports ────────────────────────────
import { useRef } from 'react';
import { ImagePlus, X as XIcon, Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import ProductGrid from '../components/product/ProductGrid.jsx';
import { productService } from '../services/productService.js';
import { categoryService } from '../services/categoryService.js';
import { cn } from '@/lib/utils';

const SORT_OPTIONS = [
    { value: '-createdAt', label: 'Newest First' },
    { value: '-ratings.average', label: 'Top Rated' },
    { value: '-totalSold', label: 'Most Popular' },
    { value: 'basePrice', label: 'Price: Low to High' },
    { value: '-basePrice', label: 'Price: High to Low' },
];

const PRICE_RANGES = [
    { label: 'Under ₹200', min: '', max: '200' },
    { label: '₹200 – ₹500', min: '200', max: '500' },
    { label: '₹500 – ₹1000', min: '500', max: '1000' },
    { label: 'Above ₹1000', min: '1000', max: '' },
];

// ── Human-readable labels for boolean filter chips ────────────────────────────
const FLAG_LABELS = {
    isFeatured: '⭐ Featured',
    isBestseller: '🔥 Bestseller',
    isNewArrival: '✨ New Arrival',
    isSeasonal: '🎊 Seasonal',
};

const FLAG_FILTERS = [
    { key: 'isFeatured', label: '⭐ Featured' },
    { key: 'isBestseller', label: '🔥 Bestsellers' },
    { key: 'isNewArrival', label: '✨ New Arrivals' },
    { key: 'isSeasonal', label: '🎊 Seasonal' },
];

// ── Filter Panel ──────────────────────────────────────────────────────────────
function FilterPanel({ filters, setFilter, setPriceRange, clearFilters, categories, activeCount }) {
    return (
        <div className="space-y-6">
            {activeCount > 0 && (
                <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-medium transition-colors">
                    <X className="w-3.5 h-3.5" /> Clear all ({activeCount})
                </button>
            )}

            {/* Categories */}
            <div>
                <p className="font-semibold text-sm text-gray-800 mb-3">Category</p>
                <div className="space-y-2">
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                            type="radio"
                            name="category"
                            checked={!filters.category}
                            onChange={() => setFilter('category', '')}
                            className="accent-brand-700 w-4 h-4"
                        />
                        <span className={cn(
                            'text-sm transition-colors',
                            !filters.category ? 'text-brand-700 font-semibold' : 'text-gray-600 group-hover:text-brand-700'
                        )}>
                            All Categories
                        </span>
                    </label>
                    {categories?.map((cat) => (
                        <label key={cat._id} className="flex items-center gap-2.5 cursor-pointer group">
                            <input
                                type="radio"
                                name="category"
                                checked={filters.category === cat._id}
                                onChange={() => setFilter('category', cat._id)}
                                className="accent-brand-700 w-4 h-4"
                            />
                            <span className={cn(
                                'text-sm transition-colors',
                                filters.category === cat._id
                                    ? 'text-brand-700 font-semibold'
                                    : 'text-gray-600 group-hover:text-brand-700'
                            )}>
                                {cat.name}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Price Range — uses setPriceRange (single atomic update) */}
            <div>
                <p className="font-semibold text-sm text-gray-800 mb-3">Price Range</p>
                <div className="space-y-2">
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                            type="radio"
                            name="price"
                            checked={!filters.minPrice && !filters.maxPrice}
                            onChange={() => setPriceRange('', '')}
                            className="accent-brand-700 w-4 h-4"
                        />
                        <span className={cn(
                            'text-sm transition-colors',
                            !filters.minPrice && !filters.maxPrice
                                ? 'text-brand-700 font-semibold'
                                : 'text-gray-600 group-hover:text-brand-700'
                        )}>
                            All Prices
                        </span>
                    </label>
                    {PRICE_RANGES.map((range) => {
                        const isActive =
                            filters.minPrice === range.min &&
                            filters.maxPrice === range.max;
                        return (
                            <label key={range.label} className="flex items-center gap-2.5 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="price"
                                    checked={isActive}
                                    onChange={() => setPriceRange(range.min, range.max)}
                                    className="accent-brand-700 w-4 h-4"
                                />
                                <span className={cn(
                                    'text-sm transition-colors',
                                    isActive
                                        ? 'text-brand-700 font-semibold'
                                        : 'text-gray-600 group-hover:text-brand-700'
                                )}>
                                    {range.label}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>

            <Separator />

            {/* Boolean flags */}
            <div>
                <p className="font-semibold text-sm text-gray-800 mb-3">Filter By</p>
                <div className="space-y-2">
                    {FLAG_FILTERS.map(({ key, label }) => {
                        const isChecked = filters[key] === 'true';
                        return (
                            <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
                                <div className={cn(
                                    'w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0',
                                    isChecked
                                        ? 'bg-brand-700 border-brand-700'
                                        : 'border-gray-300 group-hover:border-brand-400'
                                )}>
                                    {isChecked && (
                                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => setFilter(key, e.target.checked ? 'true' : '')}
                                        className="sr-only"
                                    />
                                </div>
                                <span className={cn(
                                    'text-sm transition-colors',
                                    isChecked ? 'text-brand-700 font-semibold' : 'text-gray-600 group-hover:text-brand-700'
                                )}>
                                    {label}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProductsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [page, setPage] = useState(1);

    const getFilter = (key) => searchParams.get(key) || '';

    const filters = {
        category: getFilter('category'),
        search: getFilter('search'),
        minPrice: getFilter('minPrice'),
        maxPrice: getFilter('maxPrice'),
        isFeatured: getFilter('isFeatured'),
        isBestseller: getFilter('isBestseller'),
        isNewArrival: getFilter('isNewArrival'),
        isSeasonal: getFilter('isSeasonal'),
        sort: getFilter('sort') || '-createdAt',
    };

    const setFilter = (key, value) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (value) next.set(key, value);
            else next.delete(key);
            return next;
        });
        setPage(1);
    };

    // ── Single atomic update for both price params ────────────────────────────────
    const setPriceRange = (min, max) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (min) next.set('minPrice', min); else next.delete('minPrice');
            if (max) next.set('maxPrice', max); else next.delete('maxPrice');
            return next;
        });
        setPage(1);
    };

    const clearFilters = () => { setSearchParams({}); setPage(1); };

    // Count active filters (exclude sort)
    const activeCount = Object.entries(filters).filter(
        ([k, v]) => v && k !== 'sort'
    ).length;

    // Build query params — omit empty values
    const queryParams = { ...filters, page, limit: 12 };
    Object.keys(queryParams).forEach((k) => { if (!queryParams[k]) delete queryParams[k]; });

    const { data, isLoading } = useQuery({
        queryKey: ['products', queryParams],
        queryFn: () => productService.getAll(queryParams),
        select: (d) => d.data,
        keepPreviousData: true,
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoryService.getAll(),
        select: (d) => d.data.data.categories,
    });

    const products = data?.data || [];
    const pagination = data?.pagination;
    const totalPages = pagination?.pages || 1;

    // ── Chip label resolver ───────────────────────────────────────────────────
    const getChipLabel = (key, value) => {
        if (key === 'category') {
            return categories?.find((c) => c._id === value)?.name || 'Category';
        }
        if (key === 'minPrice' || key === 'maxPrice') return null; // handled together below
        if (key in FLAG_LABELS) return FLAG_LABELS[key];
        if (key === 'search') return `"${value}"`;
        return value;
    };

    // Build chip list — merge minPrice + maxPrice into one chip
    const buildChips = () => {
        const chips = [];
        const seen = new Set();

        Object.entries(filters).forEach(([key, value]) => {
            if (!value || key === 'sort' || seen.has(key)) return;

            if (key === 'minPrice' || key === 'maxPrice') {
                if (!seen.has('price')) {
                    seen.add('price');
                    seen.add('minPrice');
                    seen.add('maxPrice');
                    const range = PRICE_RANGES.find(
                        (r) => r.min === filters.minPrice && r.max === filters.maxPrice
                    );
                    if (range) {
                        chips.push({
                            id: 'price',
                            label: range.label,
                            clear: () => { setFilter('minPrice', ''); setFilter('maxPrice', ''); },
                        });
                    }
                }
                return;
            }

            const label = getChipLabel(key, value);
            if (label) {
                chips.push({ id: key, label, clear: () => setFilter(key, '') });
            }
            seen.add(key);
        });

        return chips;
    };

    const chips = buildChips();

    const pageTitle =
        filters.search ? `Results for "${filters.search}"` :
            filters.isSeasonal === 'true' ? 'Seasonal Specials' :
                filters.isBestseller === 'true' ? 'Bestsellers' :
                    filters.isNewArrival === 'true' ? 'New Arrivals' :
                        filters.isFeatured === 'true' ? 'Featured Products' :
                            'All Products';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="font-display text-3xl text-brand-900">{pageTitle}</h1>
                    {pagination && (
                        <p className="text-gray-500 text-sm mt-1">{pagination.total} products found</p>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {/* Mobile filter trigger */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="lg:hidden border-brand-200 gap-2">
                                <SlidersHorizontal className="w-4 h-4" />
                                Filters
                                {activeCount > 0 && (
                                    <Badge className="bg-brand-700 text-white ml-1 text-xs px-1.5">{activeCount}</Badge>
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-72 bg-cream overflow-y-auto">
                            <SheetHeader>
                                <SheetTitle>Filters</SheetTitle>
                            </SheetHeader>
                            <div className="mt-6">
                                <FilterPanel
                                    filters={filters} setFilter={setFilter} setPriceRange={setPriceRange}
                                    clearFilters={clearFilters} categories={categories}
                                    activeCount={activeCount}
                                />
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Sort */}
                    <Select value={filters.sort} onValueChange={(v) => setFilter('sort', v)}>
                        <SelectTrigger className="w-48 border-brand-200">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            {SORT_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Active filter chips */}
            {chips.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {chips.map((chip) => (
                        <button
                            key={chip.id}
                            onClick={chip.clear}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-100 hover:bg-brand-200 text-brand-700 text-sm rounded-full font-medium transition-colors group">
                            {chip.label}
                            <X className="w-3.5 h-3.5 group-hover:text-brand-900 transition-colors" />
                        </button>
                    ))}
                    {chips.length > 1 && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm rounded-full font-medium transition-colors">
                            Clear all <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            )}

            <div className="flex gap-8">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:block w-56 shrink-0">
                    <div className="sticky top-24 bg-white rounded-2xl border border-brand-100 p-5">
                        <p className="font-display text-lg text-brand-900 mb-5">Filters</p>
                        <FilterPanel
                            filters={filters} setFilter={setFilter} setPriceRange={setPriceRange}
                            clearFilters={clearFilters} categories={categories}
                            activeCount={activeCount}
                        />
                    </div>
                </aside>

                {/* Product Grid */}
                <div className="flex-1 min-w-0">
                    <ProductGrid products={products} isLoading={isLoading} cols={3} />

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
                            <Button
                                variant="outline" size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="border-brand-200">
                                Previous
                            </Button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <Button
                                    key={p}
                                    size="sm"
                                    onClick={() => setPage(p)}
                                    className={p === page
                                        ? 'bg-brand-700 hover:bg-brand-800 text-white'
                                        : 'bg-white border border-brand-200 text-gray-700 hover:bg-brand-50'
                                    }>
                                    {p}
                                </Button>
                            ))}
                            <Button
                                variant="outline" size="sm"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="border-brand-200">
                                Next
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}