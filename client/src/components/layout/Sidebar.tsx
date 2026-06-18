'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', iconName: 'dashboard' },
  { label: 'Leads',     href: '/leads',     iconName: 'filter_list' },
];

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const { isAdmin } = usePermissions();

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    logout();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={onClose} />
      )}

      <nav
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-[240px] flex flex-col p-4',
          'bg-surface-container-low border-r border-outline-variant',
          'sidebar-transition',
          // Mobile: slide in/out
          open ? 'translate-x-0' : '-translate-x-full',
          // Desktop: always visible
          'md:translate-x-0'
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold text-lg shadow-sm">
            X
          </div>
          <div>
            <h1 className="font-bold text-lg text-primary tracking-tight">XDevFlow</h1>
            <p className="text-label-md text-secondary">CRM Engine</p>
          </div>
        </div>

        {/* New Lead Button */}
        <Link
          href="/leads/new"
          className="w-full bg-primary text-on-primary py-2 px-4 rounded-lg text-sm font-medium mb-6 hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-2"
          onClick={onClose}
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Lead
        </Link>

        {/* Navigation */}
        <div className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  active
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'text-secondary hover:bg-secondary-container/30'
                )}
              >
                <span className={cn("material-symbols-outlined text-[20px]", active && "icon-fill")}>
                  {item.iconName}
                </span>
                {item.label}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin/users"
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                pathname.startsWith('/admin')
                  ? 'bg-primary-container text-on-primary-container font-semibold'
                  : 'text-secondary hover:bg-secondary-container/30'
              )}
            >
              <span className={cn("material-symbols-outlined text-[20px]", pathname.startsWith('/admin') && "icon-fill")}>
                settings
              </span>
              Admin
            </Link>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-outline-variant/50 flex flex-col gap-1">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-secondary hover:bg-secondary-container/30 transition-all w-full cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">contact_support</span>
            Support
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-secondary hover:bg-secondary-container/30 transition-all w-full cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Logout
          </button>
        </div>
      </nav>
    </>
  );
}
