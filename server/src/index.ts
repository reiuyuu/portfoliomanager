import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'

import { routes } from './routes/index.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const swaggerDocument = YAML.load('./swagger.yml')

// Middleware
app.use(cors())
app.use(express.json())

// API routes
app.use('/api', routes)

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Swagger API docs available at http://localhost:${PORT}/api-docs`)
})
