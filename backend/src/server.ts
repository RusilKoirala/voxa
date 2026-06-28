import express from 'express'
import { db } from './db/index.js'
import dotenv from "dotenv"


const app = express()
dotenv.config()

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