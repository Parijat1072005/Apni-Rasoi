import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl mb-6">🫙</div>
      <h1 className="font-display text-6xl font-bold text-brand-800 mb-2">404</h1>
      <p className="text-xl text-gray-600 mb-2">Page not found</p>
      <p className="text-gray-400 text-sm mb-8 max-w-sm">
        Looks like this page got pickled away. Let's get you back on track.
      </p>
      <div className="flex gap-3">
        <Button asChild className="bg-brand-700 hover:bg-brand-800 text-white">
          <Link to="/">Go Home</Link>
        </Button>
        <Button asChild variant="outline" className="border-brand-200 text-brand-700">
          <Link to="/products">Browse Products</Link>
        </Button>
      </div>
    </div>
  );
}