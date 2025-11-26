import { z } from 'zod';

export const signupSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(255)
    .trim(),
  email: z.string().email().max(255).toLowerCase().trim(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(128),
  role: z.enum(['user', 'admin']).optional(),
});

export const signInSchema = z.object({
  email: z.string().email().max(255).toLowerCase().trim(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(128),
});
