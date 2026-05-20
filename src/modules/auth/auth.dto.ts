import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().trim().toLowerCase().email(),

  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),

  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;

export type LoginDto = z.infer<typeof LoginSchema>;
