import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  Tag, Ticket, Star, LogOut, Menu, X, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import useAuthStore from '../../store/authStore.js';

const NAV = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products',  icon: Package,         label: 'Products' },
  { to: '/orders',    icon: ShoppingCart,    label: 'Orders' },
  { to: '/users',     icon: Users,           label: 'Users' },
  { to: '/categories',icon: Tag,             label: 'Categories' },
  { to: '/coupons',   icon: Ticket,          label: 'Coupons' },
  { to: '/reviews',   icon: Star,            label: 'Reviews' },
];

function NavItem({ to, icon: Icon, label, collapsed, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onClick}
      className={({ isActive }) => cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative',
        isActive
          ? 'bg-brand-700 text-white shadow-sm'
          : 'text-gray-500 hover:bg-brand-50 hover:text-brand-700',
        collapsed && 'justify-center px-2'
      )}
    >
      <Icon className="w-5 h-5 shrink-0" />
      {!collapsed && <span className="text-sm font-medium">{label}</span>}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
          {label}
        </div>
      )}
    </NavLink>
  );
}

export default function Sidebar({ mobileOpen, closeMobile }) {
  const [collapsed, setCollapsed] = useState(false);
  const logout    = useAuthStore((s) => s.logout);
  const user      = useAuthStore((s) => s.user);
  const navigate  = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SidebarContent = ({ mobile = false }) => (
    <div className={cn(
      'flex flex-col h-full bg-white border-r border-gray-100',
      !mobile && (collapsed ? 'w-16' : 'w-56')
    )}>
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 border-b border-gray-100',
        collapsed && !mobile && 'justify-center px-2'
      )}>
        <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center shrink-0">
          <span className="text-white text-sm">🌿</span>
        </div>
        {(!collapsed || mobile) && (
          <div>
            <p className="font-display font-bold text-brand-800 text-sm leading-tight">Apni Rasoi</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        )}
        {!mobile && (
          <button onClick={() => setCollapsed(!collapsed)}
            className={cn('ml-auto text-gray-400 hover:text-gray-600 transition-colors', collapsed && 'mx-auto')}>
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        )}
        {mobile && (
          <button onClick={closeMobile} className="ml-auto text-gray-400">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed && !mobile} onClick={mobile ? closeMobile : undefined} />
        ))}
      </nav>

      {/* User + Logout */}
      <div className={cn('border-t border-gray-100 p-3', collapsed && !mobile && 'px-2')}>
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-2 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-700 text-sm shrink-0">
              {user?.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout}
          className={cn(
            'flex items-center gap-2 w-full px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors text-sm font-medium',
            collapsed && !mobile && 'justify-center'
          )}>
          <LogOut className="w-4 h-4 shrink-0" />
          {(!collapsed || mobile) && 'Sign Out'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex h-screen sticky top-0">
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={closeMobile} />
          <div className="relative w-64 h-full">
            <SidebarContent mobile />
          </div>
        </div>
      )}
    </>
  );
}