import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StarRating({ rating = 0, count, size = 'sm', interactive = false, onRate }) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-6 h-6' };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizes[size],
              'transition-colors',
              star <= Math.round(rating)
                ? 'fill-turmeric text-turmeric'
                : 'fill-gray-200 text-gray-200',
              interactive && 'cursor-pointer hover:fill-turmeric hover:text-turmeric'
            )}
            onClick={() => interactive && onRate?.(star)}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-gray-500">({count})</span>
      )}
    </div>
  );
}