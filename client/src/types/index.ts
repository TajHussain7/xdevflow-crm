// ─────────────────────────────────────────────────────────────
// XDevFlow CRM — Shared TypeScript Types
// ─────────────────────────────────────────────────────────────

export type Role = 'admin' | 'manager' | 'user';

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal'
  | 'closed_won'
  | 'closed_lost';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  created_at: string;
  updated_at?: string;
}

export interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company: string;
  status: LeadStatus;
  notes?: string | null;
  assigned_to?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator?: Pick<Profile, 'id' | 'full_name' | 'email'>;
  assignee?: Pick<Profile, 'id' | 'full_name' | 'email'> | null;
}

export interface ActivityLog {
  id: string;
  lead_id: string;
  user_id: string;
  action: 'created' | 'updated' | 'deleted';
  changed_fields: Record<string, { from: unknown; to: unknown }> | null;
  created_at: string;
  user?: Pick<Profile, 'id' | 'full_name' | 'email'>;
}

export interface DashboardStats {
  total_leads: number;
  new_leads: number;
  qualified_leads: number;
  closed_leads: number;
  won_leads: number;
  lost_leads: number;
  pipeline_breakdown: Array<{ status: LeadStatus; count: number }>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export interface LeadQueryParams {
  search?: string;
  status?: LeadStatus | '';
  page?: number;
  limit?: number;
}

export interface CreateLeadInput {
  full_name: string;
  email: string;
  phone: string;
  company: string;
  status?: LeadStatus;
  notes?: string;
  assigned_to?: string;
}

export type UpdateLeadInput = Partial<CreateLeadInput>;
