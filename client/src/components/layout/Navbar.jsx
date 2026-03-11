import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingCart, Heart, Search, Menu, User,
  LogOut, LayoutDashboard, Package, ChevronDown, X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import useAuthStore from '../../store/authStore.js';
import useCartStore from '../../store/cartStore.js';
import useUiStore from '../../store/uiStore.js';
import { categoryService } from '../../services/categoryService.js';

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const itemCount = useCartStore((s) => s.itemCount());
  const openCart = useCartStore((s) => s.openCart);
  const isSearchOpen = useUiStore((s) => s.isSearchOpen);
  const openSearch = useUiStore((s) => s.openSearch);
  const isMobileMenuOpen = useUiStore((s) => s.isMobileMenuOpen);
  const openMobileMenu = useUiStore((s) => s.openMobileMenu);
  const closeMobileMenu = useUiStore((s) => s.closeMobileMenu);
  const navigate = useNavigate();


  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!categoryMenuOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCategoryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [categoryMenuOpen]);

  // ── Fetch all active categories ───────────────────────────────────────────
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
    select: (d) => d.data.data.categories || [],
    staleTime: 1000 * 60 * 10, // 10 min — categories rarely change
  });

  // ── Fetch seasonal categories for the special nav item ───────────────────
  const { data: seasonalCategories = [] } = useQuery({
    queryKey: ['categories', 'seasonal'],
    queryFn: () => categoryService.getSeasonal(),
    select: (d) => d.data.data.categories || [],
    staleTime: 1000 * 60 * 10,
  });

  // Split: regular (non-seasonal) vs seasonal
  const regularCategories = categories.filter((c) => !c.isSeasonal);
  const hasSeasonalNow = seasonalCategories.length > 0;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-brand-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-full bg-brand-700 flex items-center justify-center shadow-sm">
              <span className="text-white text-lg">🌿</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-display font-bold text-brand-800 text-lg leading-tight">Apni Rasoi</p>
              <p className="text-[10px] text-brand-500 leading-tight -mt-0.5 tracking-widest uppercase">Handcrafted Pickles</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">

            {/* Pickles — click to open dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setCategoryMenuOpen((prev) => !prev)}
                className={cn(
                  'flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  categoryMenuOpen
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-brand-50 hover:text-brand-700'
                )}>
                Pickles <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', categoryMenuOpen && 'rotate-180')} />
              </button>

              {/* Dropdown — no overlay needed */}
              {categoryMenuOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-2xl shadow-lg border border-brand-100 overflow-hidden z-50">
                  <Link
                    to="/products"
                    onClick={() => setCategoryMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-brand-700 font-semibold hover:bg-brand-50 border-b border-brand-50 transition-colors">
                    🫙 All Pickles & Products
                  </Link>
                  {regularCategories.length > 0 ? (
                    regularCategories.map((cat) => (
                      <Link
                        key={cat._id}
                        to={`/products?category=${cat._id}`}
                        onClick={() => setCategoryMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-brand-50 hover:text-brand-700 transition-colors">
                        <div className="w-7 h-7 rounded-lg bg-brand-50 overflow-hidden flex items-center justify-center shrink-0">
                          {cat.image?.url
                            ? <img src={cat.image.url} alt={cat.name} className="w-full h-full object-cover" />
                            : <span className="text-sm">🫙</span>
                          }
                        </div>
                        {cat.name}
                      </Link>
                    ))
                  ) : (
                    <p className="px-4 py-3 text-xs text-gray-400">No categories yet</p>
                  )}
                </div>
              )}
            </div>

            {/* Seasonal — only show if there are active seasonal categories */}
            {hasSeasonalNow && (
              <Link
                to="/products?isSeasonal=true"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-brand-50 hover:text-brand-700 transition-colors">
                <span className="text-base">🎊</span> Seasonal
              </Link>
            )}

            <Link
              to="/products?isBestseller=true"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-brand-50 hover:text-brand-700 transition-colors">
              Bestsellers
            </Link>

            <Link
              to="/products?isNewArrival=true"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-brand-50 hover:text-brand-700 transition-colors">
              New Arrivals
            </Link>
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button
              onClick={openSearch}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-brand-50 hover:text-brand-700 transition-colors">
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            {user && (
              <Link
                to="/wishlist"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-brand-50 hover:text-brand-700 transition-colors">
                <Heart className="w-5 h-5" />
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-brand-50 hover:text-brand-700 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] min-h-[18px] bg-brand-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none px-0.5">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* User menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors ml-1">
                    <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-700 text-sm">
                      {user.name?.charAt(0)}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[80px] truncate">
                      {user.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-2xl border-brand-100">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4 text-brand-600" /> My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="flex items-center gap-2 cursor-pointer">
                      <Package className="w-4 h-4 text-brand-600" /> My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist" className="flex items-center gap-2 cursor-pointer">
                      <Heart className="w-4 h-4 text-brand-600" /> Wishlist
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <a href="http://localhost:5174" target="_blank" rel="noreferrer"
                          className="flex items-center gap-2 cursor-pointer text-brand-700 font-medium">
                          <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                        </a>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}
                    className="flex items-center gap-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2 ml-1">
                <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:text-brand-700">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild size="sm" className="bg-brand-700 hover:bg-brand-800 text-white">
                  <Link to="/register">Join</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={isMobileMenuOpen ? closeMobileMenu : openMobileMenu}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-brand-50 transition-colors ml-1">
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-brand-100 bg-white px-4 py-4 space-y-1">
          {/* Categories section */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-2 pt-1 pb-2">
            Shop by Category
          </p>
          <Link to="/products" onClick={closeMobileMenu}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-brand-700 hover:bg-brand-50 transition-colors">
            🫙 All Products
          </Link>
          {regularCategories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat._id}`}
              onClick={closeMobileMenu}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors">
              <div className="w-6 h-6 rounded-md bg-brand-50 overflow-hidden flex items-center justify-center shrink-0">
                {cat.image?.url
                  ? <img src={cat.image.url} alt={cat.name} className="w-full h-full object-cover" />
                  : <span className="text-xs">🫙</span>
                }
              </div>
              {cat.name}
            </Link>
          ))}

          <div className="border-t border-brand-50 my-2" />

          {/* Quick links */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-2 pt-1 pb-2">
            Quick Links
          </p>
          {hasSeasonalNow && (
            <Link to="/products?isSeasonal=true" onClick={closeMobileMenu}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors">
              🎊 Seasonal Specials
            </Link>
          )}
          <Link to="/products?isBestseller=true" onClick={closeMobileMenu}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors">
            🔥 Bestsellers
          </Link>
          <Link to="/products?isNewArrival=true" onClick={closeMobileMenu}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors">
            ✨ New Arrivals
          </Link>

          <div className="border-t border-brand-50 my-2" />

          {/* Auth */}
          {user ? (
            <>
              <Link to="/profile" onClick={closeMobileMenu}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-brand-50 transition-colors">
                <User className="w-4 h-4 text-brand-600" /> My Profile
              </Link>
              <Link to="/orders" onClick={closeMobileMenu}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-brand-50 transition-colors">
                <Package className="w-4 h-4 text-brand-600" /> My Orders
              </Link>
              <button onClick={() => { handleLogout(); closeMobileMenu(); }}
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </>
          ) : (
            <div className="flex gap-3 pt-2">
              <Button asChild variant="outline" className="flex-1 border-brand-200 text-brand-700">
                <Link to="/login" onClick={closeMobileMenu}>Sign In</Link>
              </Button>
              <Button asChild className="flex-1 bg-brand-700 hover:bg-brand-800 text-white">
                <Link to="/register" onClick={closeMobileMenu}>Join</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}