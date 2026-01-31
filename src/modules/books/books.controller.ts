import { Context } from 'hono'
import { booksService } from './books.service'
import {
  listBooksQuerySchema,
  bookIdParamSchema,
  updateBookSchema,
} from './books.schema'
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

  async updateBook(c: Context) {
    try {
      // Get user from auth middleware
      const user = c.get('user')

      // Get book ID from params
      const params = c.req.param()
      const { id } = bookIdParamSchema.parse(params)

      // Get and validate request body
      const body = await c.req.json()
      const validatedData = updateBookSchema.parse(body)

      // Check if at least one field is provided
      if (Object.keys(validatedData).length === 0) {
        return c.json(
          {
            success: false,
            message: 'At least one field is required for update',
          },
          400
        )
      }

      // Update the book
      const updatedBook = await booksService.updateBook(
        id,
        user.userId,
        validatedData
      )

      return c.json(
        {
          success: true,
          message: 'Book updated successfully',
          data: updatedBook,
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

      if (error instanceof Error) {
        if (error.message === 'Book not found') {
          return c.json(
            {
              success: false,
              message: 'Book not found',
            },
            404
          )
        }

        if (error.message === 'You are not authorized to edit this book') {
          return c.json(
            {
              success: false,
              message: 'You are not authorized to edit this book',
            },
            403
          )
        }
      }

      console.error('Update book error:', error)
      return c.json(
        {
          success: false,
          message: 'Failed to update book',
        },
        500
      )
    }
  }

  async deleteBook(c: Context) {
    try {
      // Get user from auth middleware
      const user = c.get('user')

      // Get book ID from params
      const params = c.req.param()
      const { id } = bookIdParamSchema.parse(params)

      // Delete the book
      await booksService.deleteBook(id, user.userId)

      return c.json(
        {
          success: true,
          message: 'Book deleted successfully',
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

      if (error instanceof Error) {
        if (error.message === 'Book not found') {
          return c.json(
            {
              success: false,
              message: 'Book not found',
            },
            404
          )
        }

        if (error.message === 'You are not authorized to delete this book') {
          return c.json(
            {
              success: false,
              message: 'You are not authorized to delete this book',
            },
            403
          )
        }
      }

      console.error('Delete book error:', error)
      return c.json(
        {
          success: false,
          message: 'Failed to delete book',
        },
        500
      )
    }
  }
}

export const booksController = new BooksController()
