'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { DashboardStats, ApiResponse } from '@/types';

export const useDashboardStats = () =>
  useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () =>
      api.get<ApiResponse<DashboardStats>>('/dashboard/stats').then((r) => r.data.data),
    staleTime: 30_000,
  });
