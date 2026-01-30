import { z } from 'zod'

// Validation schema for user registration
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters')
    .trim(),
  email: z.string().email('Invalid email format').toLowerCase().trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

// Validation schema for user login
export const loginSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
})

// TypeScript types inferred from schemas
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
