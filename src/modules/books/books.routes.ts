import { Hono } from 'hono'
import { booksController } from './books.controller'

export const booksRoutes = new Hono()

// GET /books - List all books with pagination
booksRoutes.get('/', (c) => booksController.listBooks(c))
