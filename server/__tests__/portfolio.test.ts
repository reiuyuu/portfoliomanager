import request from 'supertest'

import { createApp } from '../src/app'

describe('Portfolio Routes', () => {
  const app = createApp()

  beforeEach(() => {
    // Reset all mock functions before each test
    jest.clearAllMocks()
  })

  describe('GET /api/portfolio', () => {
    it('should handle database error', async () => {
      global.mockDb.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' },
        }),
      })

      const response = await request(app).get('/api/portfolio').expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Database connection failed')
    })

    it('should return empty portfolio', async () => {
      global.mockDb.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      })

      const response = await request(app).get('/api/portfolio').expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.count).toBe(0)
      expect(response.body.data).toEqual([])
    })
  })

  describe('POST /api/portfolio/buy', () => {
    it('should reject invalid request body - missing stockId', async () => {
      const response = await request(app)
        .post('/api/portfolio/buy')
        .send({
          volume: 10,
          currentPrice: 150.25,
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('numeric stockId')
    })

    it('should reject invalid request body - invalid stockId type', async () => {
      const response = await request(app)
        .post('/api/portfolio/buy')
        .send({
          stockId: 'invalid',
          volume: 10,
          currentPrice: 150.25,
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('numeric stockId')
    })

    it('should reject invalid request body - missing volume', async () => {
      const response = await request(app)
        .post('/api/portfolio/buy')
        .send({
          stockId: 1,
          currentPrice: 150.25,
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('numeric')
    })

    it('should handle stock not found', async () => {
      global.mockDb.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Stock not found' },
        }),
      })

      const response = await request(app)
        .post('/api/portfolio/buy')
        .send({
          stockId: 999,
          volume: 10,
          currentPrice: 150.25,
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Stock not found')
    })
  })

  describe('POST /api/portfolio/sell', () => {
    it('should reject invalid stockId', async () => {
      const response = await request(app)
        .post('/api/portfolio/sell')
        .send({
          stockId: 'invalid',
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Invalid stockId')
    })

    it('should handle portfolio item not found', async () => {
      global.mockDb.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'No rows found' },
        }),
      })

      const response = await request(app)
        .post('/api/portfolio/sell')
        .send({
          stockId: 999,
        })
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Portfolio item not found')
    })

    it('should handle price not found', async () => {
      global.mockDb.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 1, stock_id: 1, volume: 100 },
            error: null,
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'No price data' },
          }),
        })

      const response = await request(app)
        .post('/api/portfolio/sell')
        .send({
          stockId: 1,
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Price not found')
    })
  })
})
