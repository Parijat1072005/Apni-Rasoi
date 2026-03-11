import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import useUIStore from '../../store/uiStore.js';
import useAuthStore from '../../store/authStore.js';

const LINKS = [
  { label: '🥫 All Products',   href: '/products' },
  { label: '🫙 Pickles',        href: '/products?category=pickles' },
  { label: '🎊 Seasonal',       href: '/products?isSeasonal=true' },
  { label: '⭐ Bestsellers',    href: '/products?isBestseller=true' },
  { label: '✨ New Arrivals',   href: '/products?isNewArrival=true' },
];

export default function MobileMenu() {
  const isOpen = useUIStore((s) => s.isMobileMenuOpen);
  const close  = useUIStore((s) => s.closeMobileMenu);
  const user   = useAuthStore((s) => s.user);

  return (
    <Sheet open={isOpen} onOpenChange={close}>
      <SheetContent side="left" className="w-72 bg-cream">
        <SheetHeader>
          <SheetTitle className="font-display text-brand-800 flex items-center gap-2">
            <span>🌿</span> Apni Rasoi
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-8 flex flex-col gap-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={close}
              className="px-3 py-3 rounded-lg text-gray-700 hover:bg-brand-50 hover:text-brand-800 font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 border-t border-brand-100 pt-6">
          {user ? (
            <Link to="/profile" onClick={close}>
              <Button className="w-full bg-brand-700 hover:bg-brand-800">My Account</Button>
            </Link>
          ) : (
            <div className="flex flex-col gap-3">
              <Link to="/login" onClick={close}>
                <Button className="w-full bg-brand-700 hover:bg-brand-800">Sign In</Button>
              </Link>
              <Link to="/register" onClick={close}>
                <Button variant="outline" className="w-full border-brand-300">Create Account</Button>
              </Link>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}