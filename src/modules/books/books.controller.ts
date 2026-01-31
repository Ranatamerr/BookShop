import { Context } from 'hono'
import { booksService } from './books.service'
import { listBooksQuerySchema, bookIdParamSchema } from './books.schema'
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

  async getBookById(c: Context) {
    try {
      const params = c.req.param()
      const { id } = bookIdParamSchema.parse(params)

      const book = await booksService.getBookById(id)

      if (!book) {
        return c.json(
          {
            success: false,
            message: 'Book not found',
          },
          404
        )
      }

      return c.json(
        {
          success: true,
          message: 'Book retrieved successfully',
          data: book,
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

      console.error('Get book error:', error)
      return c.json(
        {
          success: false,
          message: 'Failed to retrieve book',
        },
        500
      )
    }
  }
}

export const booksController = new BooksController()
