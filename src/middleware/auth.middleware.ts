import { Context, Next } from 'hono'
import { TokenService } from '../utils/tokenService'

// Extend Hono Context to include user information
declare module 'hono' {
  interface ContextVariableMap {
    user: {
      userId: number
      email: string
    }
  }
}

export async function authMiddleware(c: Context, next: Next) {
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

    // Check if token is in Bearer format
    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return c.json(
        {
          success: false,
          message: 'Invalid authorization format. Use: Bearer <token>',
        },
        401
      )
    }

    const token = parts[1]

    // Check if token is blacklisted
    const isBlacklisted = await TokenService.isTokenBlacklisted(token)
    if (isBlacklisted) {
      return c.json(
        {
          success: false,
          message: 'Token has been revoked',
        },
        401
      )
    }

    // Verify token
    const decoded = TokenService.verifyToken(token)

    // Attach user info to context
    c.set('user', {
      userId: decoded.userId,
      email: decoded.email,
    })

    // Continue to next middleware/handler
    await next()
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Invalid or expired token'
    ) {
      return c.json(
        {
          success: false,
          message: 'Invalid or expired token',
        },
        401
      )
    }

    console.error('Auth middleware error:', error)
    return c.json(
      {
        success: false,
        message: 'Authentication failed',
      },
      401
    )
  }
}
