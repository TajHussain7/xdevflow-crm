import { z } from 'zod';

const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'closed_won', 'closed_lost'];

export const leadSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email:     z.string().email('Must be a valid email address'),
  phone:     z.string().min(7, 'Phone number too short').max(20, 'Phone number too long'),
  company:   z.string().min(1, 'Company is required').max(100),
  status:    z.enum(LEAD_STATUSES).default('new'),
  notes:     z.string().max(1000, 'Notes cannot exceed 1000 characters').optional().nullable(),
  assigned_to: z.string().uuid('Must be a valid user ID').optional().nullable(),
});

export const leadUpdateSchema = leadSchema.partial();

export const roleUpdateSchema = z.object({
  role: z.enum(['admin', 'manager', 'user']),
});
