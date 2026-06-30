import express from 'express'
import dotenv from "dotenv"
import cookieParser from 'cookie-parser'
import cors from 'cors'

dotenv.config()

import { db } from './db/index.js'
import authRoutes from './routes/auth'
import communityRoutes from './routes/community'
import postRoutes from './routes/post'
import commentRoutes from './routes/comment'
import voteRoutes from './routes/vote'
import userRoutes from './routes/user'

const app = express()

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/communities', communityRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/comments',commentRoutes)
app.use('/api/votes', voteRoutes)
app.use('/api/users', userRoutes)


// Health Route
app.get('/healthz', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy and running :)'
  })
})


// port
const PORT = process.env.PORT || 8000

// app listen
app.listen(PORT, () => {
  console.log(`Server is running in http://localhost:${PORT}`)
})