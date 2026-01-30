import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '../../config/db'
import { users } from '../../db/schema/users.schema'
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './auth.schema'
import { TokenService } from '../../utils/tokenService'
import { redis } from '../../config/redis'

export class AuthService {
  static async registerUser(data: RegisterInput) {
    const { username, email, password } = data

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existingUser.length > 0) {
      throw new Error('User with this email already exists')
    }

    // Check if username is taken
    const existingUsername = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1)

    if (existingUsername.length > 0) {
      throw new Error('Username is already taken')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        email,
        passwordHash,
      })
      .returning()

    // Remove password hash from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...userWithoutPassword } = newUser

    return userWithoutPassword
  }

  static async loginUser(data: LoginInput) {
    const { email, password } = data

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (!user) {
      throw new Error('Invalid email or password')
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      throw new Error('Invalid email or password')
    }

    // Generate tokens
    const tokens = await TokenService.generateTokens({
      userId: user.id,
      email: user.email,
    })

    // Remove password hash from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
      ...tokens,
    }
  }

  static async logoutUser(token: string): Promise<void> {
    // Get token expiry time
    const expiresIn = TokenService.getTokenExpiry(token)

    // Blacklist the token
    await TokenService.blacklistToken(token, expiresIn)
  }

  static async forgotPassword(data: ForgotPasswordInput): Promise<void> {
    const { email } = data

    // Check if user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    // For security, don't reveal if email exists or not
    // Always return success to prevent email enumeration
    if (!user) {
      // Silently return without error
      return
    }

    // Static OTP for testing
    const otp = '123456'

    // Store OTP in Redis with 10 minutes expiry (600 seconds)
    const otpKey = `otp:${email}`
    await redis.setex(otpKey, 600, otp)

    // In production, you would send this OTP via email
    // For now, it's stored in Redis and can be retrieved for testing
    console.log(`OTP for ${email}: ${otp}`)
  }

  static async resetPassword(data: ResetPasswordInput): Promise<void> {
    const { email, otp, newPassword } = data

    // Get OTP from Redis
    const otpKey = `otp:${email}`
    const storedOtp = await redis.get(otpKey)

    // Verify OTP
    if (!storedOtp || storedOtp !== otp) {
      throw new Error('Invalid or expired OTP')
    }

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (!user) {
      throw new Error('User not found')
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10)

    // Update user password
    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.email, email))

    // Delete OTP from Redis after successful reset
    await redis.del(otpKey)
  }
}
