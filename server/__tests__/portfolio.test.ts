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
    it('should reject invalid stockId (non-numeric string)', async () => {
      const response = await request(app)
        .post('/api/portfolio/sell')
        .send({
          stockId: 'invalid',
          volume: '10',
          currentPrice: '150.25',
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe(
        'Invalid stockId, volume, or currentPrice',
      )
    })

    it('should reject invalid volume (non-numeric string)', async () => {
      const response = await request(app)
        .post('/api/portfolio/sell')
        .send({
          stockId: '1',
          volume: 'invalid',
          currentPrice: '150.25',
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe(
        'Invalid stockId, volume, or currentPrice',
      )
    })

    it('should reject invalid currentPrice (non-numeric string)', async () => {
      const response = await request(app)
        .post('/api/portfolio/sell')
        .send({
          stockId: '1',
          volume: '10',
          currentPrice: 'invalid',
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe(
        'Invalid stockId, volume, or currentPrice',
      )
    })

    it('should reject zero volume', async () => {
      const response = await request(app)
        .post('/api/portfolio/sell')
        .send({
          stockId: '1',
          volume: '0',
          currentPrice: '150.25',
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe(
        'Invalid stockId, volume, or currentPrice',
      )
    })

    it('should reject negative volume', async () => {
      const response = await request(app)
        .post('/api/portfolio/sell')
        .send({
          stockId: '1',
          volume: '-10',
          currentPrice: '150.25',
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe(
        'Invalid stockId, volume, or currentPrice',
      )
    })

    it('should reject zero currentPrice', async () => {
      const response = await request(app)
        .post('/api/portfolio/sell')
        .send({
          stockId: '1',
          volume: '10',
          currentPrice: '0',
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe(
        'Invalid stockId, volume, or currentPrice',
      )
    })

    it('should reject negative currentPrice', async () => {
      const response = await request(app)
        .post('/api/portfolio/sell')
        .send({
          stockId: '1',
          volume: '10',
          currentPrice: '-150.25',
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe(
        'Invalid stockId, volume, or currentPrice',
      )
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
          stockId: '999',
          volume: '10',
          currentPrice: '150.25',
        })
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Portfolio item not found')
    })

    it('should reject sell volume exceeding holding volume', async () => {
      global.mockDb.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 1, stock_id: 1, volume: 50, avg_price: 100 },
          error: null,
        }),
      })

      const response = await request(app)
        .post('/api/portfolio/sell')
        .send({
          stockId: '1',
          volume: '100', // Trying to sell more than held (50)
          currentPrice: '150.25',
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Sell volume exceeds holding volume')
    })

    it('should handle profile not found', async () => {
      global.mockDb.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 1, stock_id: 1, volume: 100, avg_price: 100 },
            error: null,
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Profile not found' },
          }),
        })

      const response = await request(app)
        .post('/api/portfolio/sell')
        .send({
          stockId: '1',
          volume: '10',
          currentPrice: '150.25',
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Profile not found')
    })

    it('should handle missing initial investment', async () => {
      global.mockDb.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 1, stock_id: 1, volume: 100, avg_price: 100 },
            error: null,
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 1, balance: 1000, holdings: 500, init_invest: null },
            error: null,
          }),
        })

      const response = await request(app)
        .post('/api/portfolio/sell')
        .send({
          stockId: '1',
          volume: '10',
          currentPrice: '150.25',
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Initial investment is missing')
    })

    it('should handle profile update error', async () => {
      global.mockDb.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 1, stock_id: 1, volume: 100, avg_price: 100 },
            error: null,
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 1, balance: 1000, holdings: 500, init_invest: 1000 },
            error: null,
          }),
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            error: { message: 'Profile update failed' },
          }),
        })

      const response = await request(app)
        .post('/api/portfolio/sell')
        .send({
          stockId: '1',
          volume: '10',
          currentPrice: '150.25',
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Profile update failed')
    })

    it('should handle partial sell successfully', async () => {
      global.mockDb.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 1, stock_id: 1, volume: 100, avg_price: 100 },
            error: null,
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 1, balance: 1000, holdings: 500, init_invest: 1000 },
            error: null,
          }),
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        })

      const response = await request(app)
        .post('/api/portfolio/sell')
        .send({
          stockId: '1',
          volume: '50', // Partial sell
          currentPrice: '150.25',
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Sell operation successful')
    })

    it('should handle full sell successfully (delete record)', async () => {
      global.mockDb.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 1, stock_id: 1, volume: 100, avg_price: 100 },
            error: null,
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 1, balance: 1000, holdings: 500, init_invest: 1000 },
            error: null,
          }),
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        })
        .mockReturnValueOnce({
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        })

      const response = await request(app)
        .post('/api/portfolio/sell')
        .send({
          stockId: '1',
          volume: '100', // Full sell
          currentPrice: '150.25',
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Sell operation successful')
    })

    it('should handle portfolio holding update error', async () => {
      global.mockDb.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 1, stock_id: 1, volume: 100, avg_price: 100 },
            error: null,
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 1, balance: 1000, holdings: 500, init_invest: 1000 },
            error: null,
          }),
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            error: { message: 'Portfolio update failed' },
          }),
        })

      const response = await request(app)
        .post('/api/portfolio/sell')
        .send({
          stockId: '1',
          volume: '50',
          currentPrice: '150.25',
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Portfolio update failed')
    })

    it('should handle portfolio holding delete error', async () => {
      global.mockDb.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 1, stock_id: 1, volume: 100, avg_price: 100 },
            error: null,
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 1, balance: 1000, holdings: 500, init_invest: 1000 },
            error: null,
          }),
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        })
        .mockReturnValueOnce({
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            error: { message: 'Portfolio delete failed' },
          }),
        })

      const response = await request(app)
        .post('/api/portfolio/sell')
        .send({
          stockId: '1',
          volume: '100', // Full sell
          currentPrice: '150.25',
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Portfolio delete failed')
    })

    it('should handle unexpected server error', async () => {
      global.mockDb.from.mockImplementation(() => {
        throw new Error('Database connection lost')
      })

      const response = await request(app)
        .post('/api/portfolio/sell')
        .send({
          stockId: '1',
          volume: '10',
          currentPrice: '150.25',
        })
        .expect(500)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Database connection lost')
    })
  })
})
