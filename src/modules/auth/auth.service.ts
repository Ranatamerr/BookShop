import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '../../config/db'
import { users } from '../../db/schema/users.schema'
import type { RegisterInput, LoginInput } from './auth.schema'

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

    // Remove password hash from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...userWithoutPassword } = user

    return userWithoutPassword
  }
}
