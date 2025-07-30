import request from 'supertest'

import { createApp } from '../src/app'

describe('Auth Routes', () => {
  const app = createApp()

  beforeEach(() => {
    // Reset all mock functions before each test
    jest.clearAllMocks()
  })

  describe('POST /api/auth/signup', () => {
    it('should signup successfully', async () => {
      // Mock successful signup response
      global.mockDb.auth.signUp.mockResolvedValue({
        data: { user: { id: '123', email: 'test@example.com' } },
        error: null,
      })

      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(global.mockDb.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('should handle signup error', async () => {
      // Mock signup error
      global.mockDb.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'Email already exists' },
      })

      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'existing@example.com',
          password: 'password123',
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Email already exists')
    })

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          // 缺少 password
        })
        .expect(400)

      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /api/auth/signin', () => {
    it('should signin successfully', async () => {
      global.mockDb.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: '123', email: 'test@example.com' } },
        error: null,
      })

      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(global.mockDb.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('should handle signin error', async () => {
      global.mockDb.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' },
      })

      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpassword',
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Invalid credentials')
    })
  })

  describe('POST /api/auth/signout', () => {
    it('should signout successfully', async () => {
      global.mockDb.auth.signOut.mockResolvedValue({
        error: null,
      })

      const response = await request(app).post('/api/auth/signout').expect(200)

      expect(response.body.success).toBe(true)
      expect(global.mockDb.auth.signOut).toHaveBeenCalled()
    })

    it('should handle signout error', async () => {
      global.mockDb.auth.signOut.mockResolvedValue({
        error: { message: 'Signout failed' },
      })

      const response = await request(app).post('/api/auth/signout').expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Signout failed')
    })
  })
})
