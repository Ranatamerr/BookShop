import jwt from 'jsonwebtoken'
import { redis } from '../config/redis'

interface TokenPayload {
  userId: number
  email: string
}

interface TokenResponse {
  accessToken: string
  refreshToken: string
}

export class TokenService {
  private static readonly JWT_SECRET =
    process.env.JWT_SECRET || 'default-secret-change-in-production'
  private static readonly ACCESS_TOKEN_EXPIRY =
    process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m'
  private static readonly REFRESH_TOKEN_EXPIRY =
    process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d'

  // Redis key prefixes
  private static readonly ACCESS_TOKEN_PREFIX = 'access_token:'
  private static readonly REFRESH_TOKEN_PREFIX = 'refresh_token:'
  private static readonly BLACKLIST_PREFIX = 'blacklist:'

  // Generate access and refresh tokens
  static async generateTokens(payload: TokenPayload): Promise<TokenResponse> {
    const accessToken = jwt.sign(
      payload,
      this.JWT_SECRET,
      {
        expiresIn: this.ACCESS_TOKEN_EXPIRY,
      } as jwt.SignOptions
    )

    const refreshToken = jwt.sign(
      payload,
      this.JWT_SECRET,
      {
        expiresIn: this.REFRESH_TOKEN_EXPIRY,
      } as jwt.SignOptions
    )

    // Store tokens in Redis with expiry
    const accessTokenKey = `${this.ACCESS_TOKEN_PREFIX}${payload.userId}`
    const refreshTokenKey = `${this.REFRESH_TOKEN_PREFIX}${payload.userId}`

    // Store access token for 15 minutes (900 seconds)
    await redis.setex(accessTokenKey, 900, accessToken)

    // Store refresh token for 7 days (604800 seconds)
    await redis.setex(refreshTokenKey, 604800, refreshToken)

    return { accessToken, refreshToken }
  }

  // Verify and decode token
  static verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as TokenPayload
      return decoded
    } catch {
      throw new Error('Invalid or expired token')
    }
  }

  // Check if token is blacklisted
  static async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklistKey = `${this.BLACKLIST_PREFIX}${token}`
    const result = await redis.exists(blacklistKey)
    return result === 1
  }

  // Blacklist a token (for logout)
  static async blacklistToken(
    token: string,
    expiresIn: number
  ): Promise<void> {
    const blacklistKey = `${this.BLACKLIST_PREFIX}${token}`
    // Store in blacklist until token would naturally expire
    await redis.setex(blacklistKey, expiresIn, 'blacklisted')
  }

  // Invalidate all tokens for a user (logout from all devices)
  static async invalidateUserTokens(userId: number): Promise<void> {
    const accessTokenKey = `${this.ACCESS_TOKEN_PREFIX}${userId}`
    const refreshTokenKey = `${this.REFRESH_TOKEN_PREFIX}${userId}`

    await redis.del(accessTokenKey)
    await redis.del(refreshTokenKey)
  }

  // Get token expiry time in seconds
  static getTokenExpiry(token: string): number {
    try {
      const decoded = jwt.decode(token) as { exp?: number }
      if (decoded && decoded.exp) {
        const now = Math.floor(Date.now() / 1000)
        return Math.max(0, decoded.exp - now)
      }
      return 0
    } catch {
      return 0
    }
  }
}
