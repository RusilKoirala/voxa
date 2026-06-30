import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt.js'


// delcaring typee
declare global {
  namespace Express {
    interface Request {
      userId?: number
    }
  }
}


// authenticateToken function --> verify user
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {

  // token
  const token = req.cookies?.jwt || req.cookies?.token

  if (!token) {
    // response failure
    return res.status(401).json({ success: false, message: 'Access token required' })
  }

  try {
    // decoded token from cookiee
    const decoded = verifyToken(token)

    // put userId to jwt data
    req.userId = decoded.userId

    // throw to next function
    next()
  } catch (error) {

    // just throw error
    return res.status(403).json({ success: false, message: 'Invalid or expired token' })
  }
}