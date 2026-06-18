'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile } from '@/types';

interface AuthState {
  user: Profile | null;
  setUser: (user: Profile | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: 'xdevflow-auth' }
  )
);
