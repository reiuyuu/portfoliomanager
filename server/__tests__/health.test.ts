import request from 'supertest'

import { createApp } from '../src/app'

describe('Health Check', () => {
  const app = createApp()

  it('should return health status', async () => {
    const response = await request(app).get('/health').expect(200)

    expect(response.body).toEqual({
      message: 'Portfolio Manager API Server is running!',
    })
  })
})
