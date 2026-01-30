import { Context } from 'hono'
import { AuthService } from './auth.service'
import { registerSchema, loginSchema } from './auth.schema'
import { ZodError } from 'zod'

export class AuthController {
  //POST /auth/register
  static async register(c: Context) {
    try {
      // Parse and validate request body
      const body = await c.req.json()
      const validatedData = registerSchema.parse(body)

      // Call service to register user
      const user = await AuthService.registerUser(validatedData)

      // Return success response
      return c.json(
        {
          success: true,
          message: 'User registered successfully',
          data: {
            user,
          },
        },
        201
      )
    } catch (error) {
      // Handle validation errors
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

      // Handle duplicate user errors
      if (
        error instanceof Error &&
        (error.message.includes('already exists') ||
          error.message.includes('already taken'))
      ) {
        return c.json(
          {
            success: false,
            message: error.message,
          },
          409
        )
      }

      // Handle database constraint errors
      if (error instanceof Error && 'code' in error) {
        const dbError = error as { code: string }
        if (dbError.code === '23505') {
          return c.json(
            {
              success: false,
              message: 'User with this email or username already exists',
            },
            409
          )
        }
      }

      // Handle unexpected errors
      console.error('Registration error:', error)
      return c.json(
        {
          success: false,
          message: 'Registration failed. Please try again.',
        },
        500
      )
    }
  }

  // POST /auth/login
  static async login(c: Context) {
    try {
      // Parse and validate request body
      const body = await c.req.json()
      const validatedData = loginSchema.parse(body)

      // Call service to login user
      const user = await AuthService.loginUser(validatedData)

      // Return success response
      return c.json(
        {
          success: true,
          message: 'Login successful',
          data: {
            user,
          },
        },
        200
      )
    } catch (error) {
      // Handle validation errors
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

      // Handle authentication errors
      if (
        error instanceof Error &&
        error.message.includes('Invalid email or password')
      ) {
        return c.json(
          {
            success: false,
            message: 'Invalid email or password',
          },
          401
        )
      }

      // Handle unexpected errors
      console.error('Login error:', error)
      return c.json(
        {
          success: false,
          message: 'Login failed. Please try again.',
        },
        500
      )
    }
  }
}
