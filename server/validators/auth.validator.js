import { z } from 'zod';

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email:     z.string().email('Invalid email address'),
  password:  z.string().min(6, 'Password must be at least 6 characters').max(100),
});

export const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
