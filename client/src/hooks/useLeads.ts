'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  Lead,
  LeadQueryParams,
  CreateLeadInput,
  UpdateLeadInput,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

export const useLeads = (params: LeadQueryParams) =>
  useQuery({
    queryKey: ['leads', params],
    queryFn: () =>
      api.get<PaginatedResponse<Lead>>('/leads', { params }).then((r) => r.data),
    staleTime: 30_000,
  });

export const useLead = (id: string) =>
  useQuery({
    queryKey: ['lead', id],
    queryFn: () =>
      api.get<ApiResponse<Lead>>(`/leads/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });

export const useCreateLead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLeadInput) =>
      api.post<ApiResponse<Lead>>('/leads', data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdateLead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadInput }) =>
      api.put<ApiResponse<Lead>>(`/leads/${id}`, data).then((r) => r.data.data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['lead', variables.id] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['activity'] });
    },
  });
};

export const useDeleteLead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/leads/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
