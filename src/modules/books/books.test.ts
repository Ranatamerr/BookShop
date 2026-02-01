import { describe, it, expect, beforeAll } from 'vitest'
import app from '@/app'
import { createTestClient } from '@/test-utils/testClient'

const client = createTestClient(app)

describe('Books API', () => {
  let authToken: string
  let createdBookId: number

  beforeAll(async () => {
    // Login to get token
    const loginResponse = await client.post('/auth/login', {
      email: 'john@example.com',
      password: 'password123',
    })
    const body = await loginResponse.json()
    authToken = body.data.accessToken
  })

  describe('GET /books', () => {
    it('should list all books successfully', async () => {
      const response = await client.get('/books')

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body).toHaveProperty('success', true)
      expect(body.data).toBeInstanceOf(Array)
      expect(body).toHaveProperty('pagination')
    })

    it('should filter books by category', async () => {
      const response = await client.get('/books?category=Fiction')

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body).toHaveProperty('success', true)
      expect(body.data).toBeInstanceOf(Array)
    })

    it('should search books by title', async () => {
      const response = await client.get('/books?search=Harry')

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body).toHaveProperty('success', true)
      expect(body.data).toBeInstanceOf(Array)
    })

    it('should filter books by price range', async () => {
      const response = await client.get('/books?minPrice=10&maxPrice=20')

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body).toHaveProperty('success', true)
    })

    it('should sort books by title ascending', async () => {
      const response = await client.get('/books?sortBy=title_asc')

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body).toHaveProperty('success', true)
    })

    it('should return books in Arabic', async () => {
      const response = await client.get('/books?lang=ar')

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body).toHaveProperty('success', true)
      expect(body.message).toMatch(/[\u0600-\u06FF]/) // Arabic characters
    })
  })

  describe('GET /books/:id', () => {
    it('should get a book by id', async () => {
      // First get the list of books to find a valid ID
      const listResponse = await client.get('/books')
      const listBody = await listResponse.json()
      const validBookId = listBody.data[0]?.id

      if (!validBookId) {
        // Skip test if no books exist
        return
      }

      const response = await client.get(`/books/${validBookId}`)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body).toHaveProperty('success', true)
      expect(body.data).toHaveProperty('title')
      expect(body.data).toHaveProperty('price')
    })

    it('should return 404 for non-existent book', async () => {
      const response = await client.get('/books/99999')

      expect(response.status).toBe(404)
      const body = await response.json()
      expect(body).toHaveProperty('success', false)
    })
  })

  describe('POST /books', () => {
    it('should create a new book with English data', async () => {
      const newBook = {
        title: 'Test Book ' + Date.now(),
        description: 'A test book description',
        price: '25.99',
        thumbnail: 'https://example.com/test.jpg',
        authorName: 'Test Author',
        categoryName: 'Test Category',
      }

      const response = await client.post('/books', newBook, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      expect(response.status).toBe(201)
      const body = await response.json()
      expect(body).toHaveProperty('success', true)
      expect(body.data).toHaveProperty('id')
      expect(body.data).toHaveProperty('title')

      createdBookId = body.data.id
    })

    it('should create a new book with Arabic data', async () => {
      const newBook = {
        titleAr: 'كتاب اختبار ' + Date.now(),
        descriptionAr: 'وصف كتاب اختبار',
        price: '35.99',
        thumbnail: 'https://example.com/test-ar.jpg',
        authorNameAr: 'مؤلف الاختبار',
        categoryNameAr: 'فئة الاختبار',
      }

      const response = await client.post('/books?lang=ar', newBook, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      expect(response.status).toBe(201)
      const body = await response.json()
      expect(body).toHaveProperty('success', true)
      expect(body.data).toHaveProperty('id')
    })

    it('should fail without authentication', async () => {
      const newBook = {
        title: 'Test Book',
        price: '25.99',
        authorName: 'Test Author',
        categoryName: 'Test Category',
      }

      const response = await client.post('/books', newBook)

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body).toHaveProperty('success', false)
    })

    it('should fail with missing required fields', async () => {
      const newBook = {
        title: 'Test Book',
      }

      const response = await client.post('/books', newBook, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body).toHaveProperty('success', false)
      expect(body).toHaveProperty('errors')
    })
  })

  describe('GET /books/my', () => {
    it('should get user books', async () => {
      const response = await client.get('/books/my', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body).toHaveProperty('success', true)
      expect(body.data).toBeInstanceOf(Array)
      expect(body).toHaveProperty('pagination')
    })

    it('should fail without authentication', async () => {
      const response = await client.get('/books/my')

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body).toHaveProperty('success', false)
    })
  })

  describe('PUT /books/:id', () => {
    it('should update a book successfully', async () => {
      const updateData = {
        title: 'Updated Test Book',
        price: '29.99',
      }

      const response = await client.put(`/books/${createdBookId}`, updateData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body).toHaveProperty('success', true)
    })

    it('should fail without authentication', async () => {
      const updateData = {
        title: 'Updated Test Book',
      }

      const response = await client.put(`/books/${createdBookId}`, updateData)

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body).toHaveProperty('success', false)
    })
  })

  describe('DELETE /books/:id', () => {
    it('should delete a book successfully', async () => {
      const response = await client.delete(`/books/${createdBookId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body).toHaveProperty('success', true)
    })

    it('should fail without authentication', async () => {
      const response = await client.delete('/books/1')

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body).toHaveProperty('success', false)
    })

    it('should return 404 for non-existent book', async () => {
      const response = await client.delete('/books/99999', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      expect(response.status).toBe(404)
      const body = await response.json()
      expect(body).toHaveProperty('success', false)
    })
  })
})
