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
  search: z.string().optional(),
  sortBy: z.enum(['title_asc', 'title_desc']).optional().default('title_asc'),
})

export type ListBooksQuery = z.infer<typeof listBooksQuerySchema>

export const myBooksQuerySchema = z.object({
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
  search: z.string().optional(),
  sortBy: z.enum(['title_asc', 'title_desc']).optional().default('title_asc'),
})

export type MyBooksQuery = z.infer<typeof myBooksQuerySchema>

export const bookIdParamSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, { message: 'Book ID must be a positive number' }),
})

export type BookIdParam = z.infer<typeof bookIdParamSchema>

export const updateBookSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters')
    .optional(),
  description: z.string().optional(),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid decimal number')
    .refine((val) => parseFloat(val) > 0, {
      message: 'Price must be greater than 0',
    })
    .optional(),
  thumbnail: z
    .string()
    .url('Thumbnail must be a valid URL')
    .max(500, 'Thumbnail URL must not exceed 500 characters')
    .optional(),
  authorId: z
    .number()
    .int('Author ID must be an integer')
    .positive('Author ID must be a positive number')
    .optional(),
  categoryId: z
    .number()
    .int('Category ID must be an integer')
    .positive('Category ID must be a positive number')
    .optional(),
})

export type UpdateBookInput = z.infer<typeof updateBookSchema>
