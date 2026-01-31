import { Hono } from 'hono'
import { logger } from 'hono/logger'
import dotenv from 'dotenv'
import { authRoutes } from './modules/auth/auth.routes'
import { booksRoutes } from './modules/books/books.routes'

dotenv.config()

const app = new Hono()

// Middleware
app.use('*', logger())

// Health check
app.get('/', (c) =>
  c.json({ message: 'BookShop API is running', status: 'healthy' })
)

// Mount routes
app.route('/auth', authRoutes)
app.route('/books', booksRoutes)

export default app
