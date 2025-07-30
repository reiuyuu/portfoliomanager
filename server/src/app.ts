import cors from 'cors'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'

import { routes } from './routes/index.js'

export function createApp() {
  const app = express()

  // Middleware
  app.use(cors())
  app.use(express.json())

  // API routes
  app.use('/api', routes)

  // Health check
  app.get('/health', (_req, res) => {
    res
      .status(200)
      .json({ message: 'Portfolio Manager API Server is running!' })
  })

  // Swagger UI
  if (process.env.NODE_ENV !== 'test') {
    const swaggerDocument = YAML.load('./swagger.yml')
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
  }

  return app
}
