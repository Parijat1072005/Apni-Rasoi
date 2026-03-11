import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (page <= 4) return i + 1;
    if (page >= totalPages - 3) return totalPages - 6 + i;
    return page - 3 + i;
  });

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <Button variant="outline" size="icon" className="w-8 h-8 border-gray-200"
        onClick={() => onPageChange(page - 1)} disabled={page === 1}>
        <ChevronLeft className="w-4 h-4" />
      </Button>
      {pages.map((p) => (
        <Button key={p} size="sm"
          onClick={() => onPageChange(p)}
          className={`w-8 h-8 text-xs ${p === page ? 'bg-brand-700 hover:bg-brand-800 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
          {p}
        </Button>
      ))}
      <Button variant="outline" size="icon" className="w-8 h-8 border-gray-200"
        onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}