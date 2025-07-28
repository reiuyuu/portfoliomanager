import path from 'path'
import cors from 'cors'
import express from 'express'

import colorRoutes from './routes/colors'

const app = express()
const PORT = process.env.API_PORT || 3001

// Serve static files (for API docs)
const publicPath = path.join(process.cwd(), 'server/public')
app.use(express.static(publicPath))

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/colors', colorRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Colors API Server is running!' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`API docs available at http://localhost:${PORT}/api-docs.html`)
})
