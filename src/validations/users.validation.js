import { z } from 'zod';

export const userIdSchema = z.object({
  id: z.coerce.number().int().positive('User ID must be a positive integer'),
});

export const updateUserSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters long')
      .max(255)
      .trim()
      .optional(),
    email: z
      .string()
      .email('Invalid email format')
      .max(255)
      .toLowerCase()
      .trim()
      .optional(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .max(128)
      .optional(),
    role: z
      .enum(['user', 'admin'], {
        errorMap: () => ({ message: 'Role must be either "user" or "admin"' }),
      })
      .optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });
