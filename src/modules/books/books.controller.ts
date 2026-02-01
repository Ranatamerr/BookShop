import { Context } from 'hono'
import { booksService } from './books.service'
import {
  listBooksQuerySchema,
  bookIdParamSchema,
  updateBookSchema,
  myBooksQuerySchema,
  createBookSchema,
} from './books.schema'
import { ZodError } from 'zod'
import i18n from '../../config/i18n'

export class BooksController {
  async listBooks(c: Context) {
    try {
      const query = c.req.query()
      const validatedQuery = listBooksQuerySchema.parse(query)
      const language = c.get('language') || 'en'

      i18n.changeLanguage(language)

      const result = await booksService.listBooks(validatedQuery, language)

      // Check if no books found with search term
      const message =
        result.data.length === 0 && validatedQuery.search
          ? i18n.t('books.noMatching', { search: validatedQuery.search })
          : i18n.t('books.retrieved')

      return c.json(
        {
          success: true,
          message,
          ...result,
        },
        200
      )
    } catch (error) {
      if (error instanceof ZodError) {
        return c.json(
          {
            success: false,
            message: i18n.t('validation.error'),
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
          message: i18n.t('books.failed'),
        },
        500
      )
    }
  }

  async getBookById(c: Context) {
    try {
      const params = c.req.param()
      const { id } = bookIdParamSchema.parse(params)
      const language = c.get('language') || 'en'

      i18n.changeLanguage(language)

      const book = await booksService.getBookById(id, language)

      if (!book) {
        return c.json(
          {
            success: false,
            message: i18n.t('books.notFound'),
          },
          404
        )
      }

      return c.json(
        {
          success: true,
          message: i18n.t('books.retrieved'),
          data: book,
        },
        200
      )
    } catch (error) {
      if (error instanceof ZodError) {
        return c.json(
          {
            success: false,
            message: i18n.t('validation.error'),
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
          message: i18n.t('books.failed'),
        },
        500
      )
    }
  }

  async getMyBooks(c: Context) {
    try {
      // Get user from auth middleware
      const user = c.get('user')
      const language = c.get('language') || 'en'

      i18n.changeLanguage(language)

      // Get and validate query params
      const query = c.req.query()
      const validatedQuery = myBooksQuerySchema.parse(query)

      // Get user's books
      const result = await booksService.getMyBooks(
        user.userId,
        validatedQuery,
        language
      )

      // Check if no books found with search term
      const message =
        result.data.length === 0 && validatedQuery.search
          ? i18n.t('books.noMatching', { search: validatedQuery.search })
          : i18n.t('books.yourBooksRetrieved')

      return c.json(
        {
          success: true,
          message,
          ...result,
        },
        200
      )
    } catch (error) {
      if (error instanceof ZodError) {
        return c.json(
          {
            success: false,
            message: i18n.t('validation.error'),
            errors: error.issues.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
          400
        )
      }

      console.error('Get my books error:', error)
      return c.json(
        {
          success: false,
          message: i18n.t('books.failed'),
        },
        500
      )
    }
  }

  async createBook(c: Context) {
    try {
      // Get user from auth middleware
      const user = c.get('user')
      const language = c.get('language') || 'en'

      i18n.changeLanguage(language)

      // Get and validate request body
      const body = await c.req.json()
      const validatedData = createBookSchema.parse(body)

      // Create the book
      const newBook = await booksService.createBook(
        user.userId,
        validatedData,
        language
      )

      return c.json(
        {
          success: true,
          message: i18n.t('books.created'),
          data: newBook,
        },
        201
      )
    } catch (error) {
      if (error instanceof ZodError) {
        return c.json(
          {
            success: false,
            message: i18n.t('validation.error'),
            errors: error.issues.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
          400
        )
      }

      console.error('Create book error:', error)
      return c.json(
        {
          success: false,
          message: i18n.t('books.failedCreate'),
        },
        500
      )
    }
  }

  async updateBook(c: Context) {
    try {
      // Get user from auth middleware
      const user = c.get('user')
      const language = c.get('language') || 'en'

      i18n.changeLanguage(language)

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
            message: i18n.t('books.atLeastOneField'),
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
          message: i18n.t('books.updated'),
          data: updatedBook,
        },
        200
      )
    } catch (error) {
      if (error instanceof ZodError) {
        return c.json(
          {
            success: false,
            message: i18n.t('validation.error'),
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
              message: i18n.t('books.notFound'),
            },
            404
          )
        }

        if (error.message === 'You are not authorized to edit this book') {
          return c.json(
            {
              success: false,
              message: i18n.t('books.unauthorized'),
            },
            403
          )
        }
      }

      console.error('Update book error:', error)
      return c.json(
        {
          success: false,
          message: i18n.t('books.failedUpdate'),
        },
        500
      )
    }
  }

  async deleteBook(c: Context) {
    try {
      // Get user from auth middleware
      const user = c.get('user')
      const language = c.get('language') || 'en'

      i18n.changeLanguage(language)

      // Get book ID from params
      const params = c.req.param()
      const { id } = bookIdParamSchema.parse(params)

      // Delete the book
      await booksService.deleteBook(id, user.userId)

      return c.json(
        {
          success: true,
          message: i18n.t('books.deleted'),
        },
        200
      )
    } catch (error) {
      if (error instanceof ZodError) {
        return c.json(
          {
            success: false,
            message: i18n.t('validation.error'),
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
              message: i18n.t('books.notFound'),
            },
            404
          )
        }

        if (error.message === 'You are not authorized to delete this book') {
          return c.json(
            {
              success: false,
              message: i18n.t('books.unauthorizedDelete'),
            },
            403
          )
        }
      }

      console.error('Delete book error:', error)
      return c.json(
        {
          success: false,
          message: i18n.t('books.failedDelete'),
        },
        500
      )
    }
  }
}

export const booksController = new BooksController()
