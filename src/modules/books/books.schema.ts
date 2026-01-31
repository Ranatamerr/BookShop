import { z } from 'zod'

export const listBooksQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, { message: 'Page must be greater than 0' }),
  limit: z
    .string()
    .optional()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, {
      message: 'Limit must be between 1 and 100',
    }),
})

export type ListBooksQuery = z.infer<typeof listBooksQuerySchema>

export const bookIdParamSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, { message: 'Book ID must be a positive number' }),
})

export type BookIdParam = z.infer<typeof bookIdParamSchema>
