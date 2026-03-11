import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import useUIStore from '../../store/uiStore.js';

export default function SearchModal() {
  const isOpen      = useUIStore((s) => s.isSearchOpen);
  const closeSearch = useUIStore((s) => s.closeSearch);
  const [query, setQuery] = useState('');
  const navigate    = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    setQuery('');
    closeSearch();
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeSearch}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <form onSubmit={handleSearch} className="flex items-center gap-3 px-4 py-4 border-b border-brand-100">
          <Search className="w-5 h-5 text-brand-500 shrink-0" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pickles, gujiya, seasonal items..."
            className="border-0 shadow-none focus-visible:ring-0 text-base p-0 bg-transparent"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')}>
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </form>
        <div className="px-4 py-3">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Popular searches</p>
          <div className="flex flex-wrap gap-2">
            {['Mango Pickle', 'Mixed Pickle', 'Gujiya', 'Lemon Pickle', 'Amla'].map((term) => (
              <button
                key={term}
                onClick={() => { navigate(`/products?search=${encodeURIComponent(term)}`); closeSearch(); }}
                className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-sm rounded-full transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}