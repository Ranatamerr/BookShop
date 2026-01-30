import { Hono } from 'hono'
import { AuthController } from './auth.controller'

export const authRoutes = new Hono()

// User Registration
authRoutes.post('/register', AuthController.register)
