import ProductCard from './ProductCard.jsx';
import { Skeleton } from '@/components/ui/skeleton';

function ProductSkeleton() {
  return (
    <div className="rounded-xl border border-brand-100 overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  );
}

export default function ProductGrid({ products = [], isLoading, cols = 4 }) {
  const gridCols = {
    2: 'grid-cols-2 sm:grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  };

  if (isLoading) {
    return (
      <div className={`grid ${gridCols[cols]} gap-4`}>
        {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">🫙</div>
        <h3 className="font-display text-xl text-brand-800 mb-2">No products found</h3>
        <p className="text-gray-500 text-sm">Try adjusting your filters or search term</p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols[cols]} gap-4 lg:gap-6`}>
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}