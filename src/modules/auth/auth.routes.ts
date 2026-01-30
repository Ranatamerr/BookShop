import { Hono } from 'hono'
import { AuthController } from './auth.controller'
import { authMiddleware } from '../../middleware/auth.middleware'

export const authRoutes = new Hono()

// User Registration
authRoutes.post('/register', AuthController.register)

// User Login
authRoutes.post('/login', AuthController.login)

// User Logout (Protected)
authRoutes.post('/logout', authMiddleware, AuthController.logout)
