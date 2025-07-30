import dotenv from 'dotenv'

import { createApp } from './app.js'

dotenv.config()

const app = createApp()
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Swagger API docs available at http://localhost:${PORT}/api-docs`)
})
