import { Hono } from 'hono'
import { booksController } from './books.controller'
import { authMiddleware } from '../../middleware/auth.middleware'
import { languageMiddleware } from '../../middleware/language.middleware'

export const booksRoutes = new Hono()

// Apply language middleware to all routes
booksRoutes.use('*', languageMiddleware)

// GET /books - List all books with pagination
booksRoutes.get('/', (c) => booksController.listBooks(c))

// GET /books/my - Get my books with pagination (Protected)
booksRoutes.get('/my', authMiddleware, (c) => booksController.getMyBooks(c))

// POST /books - Create a new book (Protected)
booksRoutes.post('/', authMiddleware, (c) => booksController.createBook(c))

// GET /books/:id - Get book details by ID
booksRoutes.get('/:id', (c) => booksController.getBookById(c))

// PUT /books/:id - Update book (Protected - only owner)
booksRoutes.put('/:id', authMiddleware, (c) => booksController.updateBook(c))

// DELETE /books/:id - Delete book (Protected - only owner)
booksRoutes.delete('/:id', authMiddleware, (c) => booksController.deleteBook(c))
