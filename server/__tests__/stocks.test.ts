import request from 'supertest'

import { createApp } from '../src/app'

describe('Stocks Routes', () => {
  const app = createApp()

  beforeEach(() => {
    // Reset all mock functions before each test
    jest.clearAllMocks()
  })

  describe('GET /api/stocks', () => {
    it('should get stocks list successfully', async () => {
      // Mock query chain
      const mockSelect = jest.fn().mockReturnThis()
      const mockOrder = jest.fn().mockReturnThis()
      const mockLimit = jest.fn().mockResolvedValue({
        data: [
          {
            id: 1,
            symbol: 'AAPL',
            name: 'Apple Inc.',
            stock_prices: [{ price: 150.25, date: '2025-07-30' }],
          },
          {
            id: 2,
            symbol: 'GOOGL',
            name: 'Alphabet Inc.',
            stock_prices: [{ price: 2750.8, date: '2025-07-30' }],
          },
        ],
        error: null,
      })

      global.mockDb.from.mockReturnValue({
        select: mockSelect,
        order: mockOrder,
        limit: mockLimit,
      })

      const response = await request(app).get('/api/stocks').expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(2)
      expect(response.body.data[0]).toEqual({
        id: 1,
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: 150.25,
        date: '2025-07-30',
      })

      expect(global.mockDb.from).toHaveBeenCalledWith('stocks')
      expect(mockSelect).toHaveBeenCalledWith(
        `id, symbol, name,
      stock_prices!inner(price, date)`,
      )
      expect(mockOrder).toHaveBeenCalledWith('id', { ascending: true })
    })

    it('should handle database error', async () => {
      global.mockDb.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' },
        }),
      })

      const response = await request(app).get('/api/stocks').expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Database connection failed')
    })
  })

  describe('GET /api/stocks/:id/prices', () => {
    it('should get stock prices successfully', async () => {
      const mockSelect = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockReturnThis()
      const mockOrder = jest.fn().mockReturnThis()
      const mockLimit = jest.fn().mockResolvedValue({
        data: [
          { id: 1, stock_id: 1, price: 150.25, date: '2025-07-30' },
          { id: 2, stock_id: 1, price: 149.8, date: '2025-07-29' },
          { id: 3, stock_id: 1, price: 148.9, date: '2025-07-28' },
        ],
        error: null,
      })

      global.mockDb.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
        limit: mockLimit,
      })

      const response = await request(app)
        .get('/api/stocks/1/prices')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(3)
      expect(response.body.data[0].price).toBe(150.25)

      expect(global.mockDb.from).toHaveBeenCalledWith('stock_prices')
      expect(mockEq).toHaveBeenCalledWith('stock_id', '1')
      expect(mockOrder).toHaveBeenCalledWith('date', { ascending: false })
      expect(mockLimit).toHaveBeenCalledWith(10)
    })

    it('should get stock prices with custom days parameter', async () => {
      const mockSelect = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockReturnThis()
      const mockOrder = jest.fn().mockReturnThis()
      const mockLimit = jest.fn().mockResolvedValue({
        data: [
          { id: 1, stock_id: 1, price: 150.25, date: '2025-07-30' },
          { id: 2, stock_id: 1, price: 149.8, date: '2025-07-29' },
        ],
        error: null,
      })

      global.mockDb.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
        limit: mockLimit,
      })

      const response = await request(app)
        .get('/api/stocks/1/prices?days=2')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(2)
      expect(mockLimit).toHaveBeenCalledWith(2)
    })

    it('should handle database error when getting prices', async () => {
      global.mockDb.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Failed to fetch prices' },
        }),
      })

      const response = await request(app)
        .get('/api/stocks/1/prices')
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Failed to fetch prices')
    })
  })
})
