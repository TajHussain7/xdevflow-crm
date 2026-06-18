'use client';

import { useAuthStore } from '@/store/authStore';

export const usePermissions = () => {
  const user = useAuthStore((s) => s.user);
  return {
    canCreate: ['user', 'manager', 'admin'].includes(user?.role ?? ''),
    canEdit:   ['manager', 'admin'].includes(user?.role ?? ''),
    canDelete: user?.role === 'admin',
    isAdmin:   user?.role === 'admin',
    isManager: user?.role === 'manager',
    role:      user?.role ?? null,
  };
};
