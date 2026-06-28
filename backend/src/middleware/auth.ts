import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt.js'

declare global {
  namespace Express {
    interface Request {
      userId?: number
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.jwt

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' })
  }

  try {
    const decoded = verifyToken(token)
    req.userId = decoded.userId
    next()
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' })
  }
}