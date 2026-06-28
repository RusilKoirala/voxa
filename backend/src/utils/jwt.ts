import jwt from 'jsonwebtoken'

export const generateToken = (userId: number): string => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  )
}

export const verifyToken = (token: string): { userId: number } => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any
  return { userId: decoded.userId || decoded.id }
}