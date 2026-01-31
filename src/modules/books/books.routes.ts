import { Hono } from 'hono'
import { booksController } from './books.controller'
import { authMiddleware } from '../../middleware/auth.middleware'

export const booksRoutes = new Hono()

// GET /books - List all books with pagination
booksRoutes.get('/', (c) => booksController.listBooks(c))

// GET /books/:id - Get book details by ID
booksRoutes.get('/:id', (c) => booksController.getBookById(c))

// PUT /books/:id - Update book (Protected - only owner)
booksRoutes.put('/:id', authMiddleware, (c) => booksController.updateBook(c))

// DELETE /books/:id - Delete book (Protected - only owner)
booksRoutes.delete('/:id', authMiddleware, (c) => booksController.deleteBook(c))
