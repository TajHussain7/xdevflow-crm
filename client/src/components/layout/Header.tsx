'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { getInitials } from '@/lib/utils';

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="w-full h-16 bg-surface-container-lowest shadow-sm flex justify-between items-center px-4 md:px-8 sticky top-0 z-40">
      {/* Left */}
      <div className="flex items-center gap-4 w-1/3">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuToggle}
          className="md:hidden text-on-surface-variant p-2 -ml-2 rounded-lg hover:bg-surface-container-low transition-colors"
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        {/* Search - Desktop */}
        <div className="hidden md:flex relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input
            type="text"
            placeholder="Search leads, companies..."
            className="w-full pl-10 pr-4 py-2 bg-surface-container border-none rounded-full focus:ring-2 focus:ring-primary font-body-md text-body-md text-on-surface placeholder-outline sunken-input outline-none"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 flex items-center justify-center rounded-full text-secondary hover:bg-surface-container-low transition-colors relative" aria-label="Notifications">
          <span className="material-symbols-outlined text-[24px]">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-surface-container-lowest"></span>
        </button>

        <button className="w-10 h-10 flex items-center justify-center rounded-full text-secondary hover:bg-surface-container-low transition-colors hidden sm:flex" aria-label="Help">
          <span className="material-symbols-outlined text-[24px]">help</span>
        </button>

        <Link
          href="/leads/new"
          className="hidden sm:block bg-primary text-on-primary px-4 py-2 rounded font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm active:scale-95 transition-transform"
        >
          Create Lead
        </Link>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-xs font-bold border border-outline-variant cursor-pointer ml-2">
          {user ? getInitials(user.full_name) : '?'}
        </div>
      </div>
    </header>
  );
}
