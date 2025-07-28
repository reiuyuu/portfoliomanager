import cors from 'cors'
import express from 'express'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

import authRoutes from './routes/auth'
import colorRoutes from './routes/colors'
import healthRoutes from './routes/health'
import profileRoutes from './routes/profiles'
import todoRoutes from './routes/todos'
import { swaggerOptions } from './swagger.config'

const app = express()
const PORT = process.env.API_PORT || 3001

const swaggerSpec = swaggerJsdoc(swaggerOptions)

// Middleware
app.use(cors())
app.use(express.json())

// Swagger UI and JSON endpoint
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Portfolio Manager API Docs',
  }),
)

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpec)
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/colors', colorRoutes)
app.use('/api/health', healthRoutes)
app.use('/api/profiles', profileRoutes)
app.use('/api/todos', todoRoutes)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Swagger API docs available at http://localhost:${PORT}/api-docs`)
})
