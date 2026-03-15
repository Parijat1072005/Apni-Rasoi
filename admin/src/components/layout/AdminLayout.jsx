import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Menu, Bell } from 'lucide-react';
import Sidebar from './Sidebar.jsx';
import useAuthStore from '../../store/authStore.js';

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} closeMobile={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 h-14 flex items-center justify-between shrink-0">
          <button onClick={() => setMobileOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <a href="https://apnirasoiachaar.com" target="_blank" rel="noreferrer"
              className="text-xs text-brand-600 hover:text-brand-800 border border-brand-200 px-3 py-1.5 rounded-lg transition-colors">
              View Store ↗
            </a>
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-700 text-sm">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}