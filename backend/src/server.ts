import express from 'express'
import dotenv from "dotenv"

dotenv.config()

import { db } from './db/index.js'
import authRoutes from './routes/auth'
import communityRoutes from './routes/community'
import postRoutes from './routes/post'

const app = express()

// Middleware
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/communities', communityRoutes)
app.use('/api/posts', postRoutes)

app.get('/healthz', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy and running :)'
  })
})

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
  console.log(`Server is running in http://localhost:${PORT}`)
})