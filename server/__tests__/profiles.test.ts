import request from 'supertest'

import { createApp } from '../src/app'

describe('Profiles Routes', () => {
  const app = createApp()

  beforeEach(() => {
    // Reset all mock functions before each test
    jest.clearAllMocks()
  })

  describe('GET /api/profiles', () => {
    it('should get profile data when already updated today', async () => {
      const today = new Date().toISOString().split('T')[0]

      global.mockDb.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [
            {
              id: 1,
              balance: 10000,
              totalAssets: 15000,
              totalPnl: 5000,
              updated_at: `${today}T10:00:00.000Z`,
            },
          ],
          error: null,
        }),
      })

      const response = await request(app).get('/api/profiles').expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.balance).toBe(10000)
      expect(response.body.data.totalAssets).toBe(15000)
      expect(global.mockDb.from).toHaveBeenCalledWith('profiles')
    })

    it('should handle user not found', async () => {
      global.mockDb.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      })

      const response = await request(app).get('/api/profiles').expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('User not found')
    })

    it('should handle database error', async () => {
      global.mockDb.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' },
        }),
      })

      const response = await request(app).get('/api/profiles').expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('User not found')
    })
  })
})
