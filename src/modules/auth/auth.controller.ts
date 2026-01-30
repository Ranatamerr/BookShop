import { Context } from 'hono'
import { AuthService } from './auth.service'
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from './auth.schema'
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
      const result = await AuthService.loginUser(validatedData)

      // Return success response with tokens
      return c.json(
        {
          success: true,
          message: 'Login successful',
          data: result,
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

  // POST /auth/logout
  static async logout(c: Context) {
    try {
      // Get token from Authorization header
      const authHeader = c.req.header('Authorization')

      if (!authHeader) {
        return c.json(
          {
            success: false,
            message: 'Authorization header is required',
          },
          401
        )
      }

      const token = authHeader.split(' ')[1]

      if (!token) {
        return c.json(
          {
            success: false,
            message: 'Token is required',
          },
          401
        )
      }

      // Call service to logout user
      await AuthService.logoutUser(token)

      return c.json(
        {
          success: true,
          message: 'Logout successful',
        },
        200
      )
    } catch (error) {
      console.error('Logout error:', error)
      return c.json(
        {
          success: false,
          message: 'Logout failed. Please try again.',
        },
        500
      )
    }
  }

  // POST /auth/forgot-password
  static async forgotPassword(c: Context) {
    try {
      // Parse and validate request body
      const body = await c.req.json()
      const validatedData = forgotPasswordSchema.parse(body)

      // Call service to generate and store OTP
      await AuthService.forgotPassword(validatedData)

      // Always return success (don't reveal if email exists)
      return c.json(
        {
          success: true,
          message:
            'If the email exists, a password reset OTP has been sent. Please check your email.',
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

      // Handle unexpected errors
      console.error('Forgot password error:', error)
      return c.json(
        {
          success: false,
          message: 'Failed to process request. Please try again.',
        },
        500
      )
    }
  }

  // POST /auth/reset-password
  static async resetPassword(c: Context) {
    try {
      // Parse and validate request body
      const body = await c.req.json()
      const validatedData = resetPasswordSchema.parse(body)

      // Call service to reset password
      await AuthService.resetPassword(validatedData)

      return c.json(
        {
          success: true,
          message:
            'Password reset successfully. You can now login with your new password.',
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

      // Handle OTP or user errors
      if (
        error instanceof Error &&
        (error.message.includes('Invalid or expired OTP') ||
          error.message.includes('User not found'))
      ) {
        return c.json(
          {
            success: false,
            message: error.message,
          },
          400
        )
      }

      // Handle unexpected errors
      console.error('Reset password error:', error)
      return c.json(
        {
          success: false,
          message: 'Failed to reset password. Please try again.',
        },
        500
      )
    }
  }

  // POST /auth/change-password (Protected)
  static async changePassword(c: Context) {
    try {
      // Get user from context (set by auth middleware)
      const user = c.get('user')

      // Parse and validate request body
      const body = await c.req.json()
      const validatedData = changePasswordSchema.parse(body)

      // Call service to change password
      await AuthService.changePassword(user.userId, validatedData)

      return c.json(
        {
          success: true,
          message: 'Password changed successfully.',
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

      // Handle password verification errors
      if (
        error instanceof Error &&
        (error.message.includes('Current password is incorrect') ||
          error.message.includes('User not found'))
      ) {
        return c.json(
          {
            success: false,
            message: error.message,
          },
          400
        )
      }

      // Handle unexpected errors
      console.error('Change password error:', error)
      return c.json(
        {
          success: false,
          message: 'Failed to change password. Please try again.',
        },
        500
      )
    }
  }
}
