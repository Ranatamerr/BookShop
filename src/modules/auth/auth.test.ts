import { describe, it, expect, beforeAll } from 'vitest'
import app from '@/app'
import { createTestClient } from '@/test-utils/testClient'

const client = createTestClient(app)

describe('Auth API', () => {
  const testUser = {
    username: 'testuser' + Date.now(),
    email: `test${Date.now()}@example.com`,
    password: 'password123',
  }

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await client.post('/auth/register', testUser)

      expect(response.status).toBe(201)
      const body = await response.json()
      expect(body).toHaveProperty('success', true)
      expect(body).toHaveProperty('message')
      expect(body.data).toHaveProperty('user')
      expect(body.data.user).toHaveProperty('id')
      expect(body.data.user).toHaveProperty('username', testUser.username)
      expect(body.data.user).toHaveProperty('email', testUser.email)
      expect(body.data.user).not.toHaveProperty('password')
    })

    it('should fail with missing required fields', async () => {
      const response = await client.post('/auth/register', {
        username: 'testuser2',
      })

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body).toHaveProperty('success', false)
      expect(body).toHaveProperty('errors')
    })

    it('should fail with invalid email format', async () => {
      const response = await client.post('/auth/register', {
        username: 'testuser3',
        email: 'invalid-email',
        password: 'password123',
      })

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body).toHaveProperty('success', false)
    })
  })

  describe('POST /auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await client.post('/auth/login', {
        email: testUser.email,
        password: testUser.password,
      })

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body).toHaveProperty('success', true)
      expect(body).toHaveProperty('message')
      expect(body.data).toHaveProperty('accessToken')
      expect(body.data).toHaveProperty('user')
    })

    it('should fail with incorrect password', async () => {
      const response = await client.post('/auth/login', {
        email: testUser.email,
        password: 'wrongpassword',
      })

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body).toHaveProperty('success', false)
    })

    it('should fail with non-existent user', async () => {
      const response = await client.post('/auth/login', {
        email: 'nonexistent@example.com',
        password: 'password123',
      })

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body).toHaveProperty('success', false)
    })
  })

  describe('POST /auth/logout', () => {
    let token: string

    beforeAll(async () => {
      const loginResponse = await client.post('/auth/login', {
        email: testUser.email,
        password: testUser.password,
      })
      const body = await loginResponse.json()
      token = body.data.accessToken
    })

    it('should logout successfully with valid token', async () => {
      const response = await client.post('/auth/logout', undefined, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body).toHaveProperty('success', true)
    })

    it('should fail without token', async () => {
      const response = await client.post('/auth/logout')

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body).toHaveProperty('success', false)
    })
  })
})
