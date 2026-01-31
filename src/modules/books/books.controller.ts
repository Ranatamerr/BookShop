import { Context } from 'hono'
import { booksService } from './books.service'
import { listBooksQuerySchema } from './books.schema'
import { ZodError } from 'zod'

export class BooksController {
  async listBooks(c: Context) {
    try {
      const query = c.req.query()
      const validatedQuery = listBooksQuerySchema.parse(query)

      const result = await booksService.listBooks(validatedQuery)

      return c.json(
        {
          success: true,
          message: 'Books retrieved successfully',
          ...result,
        },
        200
      )
    } catch (error) {
      if (error instanceof ZodError) {
        return c.json(
          {
            success: false,
            message: 'Validation error',
            errors: error.issues.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
          400
        )
      }

      console.error('List books error:', error)
      return c.json(
        {
          success: false,
          message: 'Failed to retrieve books',
        },
        500
      )
    }
  }
}

export const booksController = new BooksController()
