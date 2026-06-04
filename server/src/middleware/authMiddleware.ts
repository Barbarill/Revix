import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: string
  userRole?: string
}

interface JwtPayload {
  userId: string
  role: string
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token mancante' })
    return
  }

  const token = authHeader.split(' ')[1]
  const secret = process.env.JWT_SECRET

  if (!secret) {
    res.status(500).json({ error: 'JWT_SECRET non configurato' })
    return
  }

  try {
    const verified = jwt.verify(token, secret)
    const decoded = (verified as unknown) as JwtPayload

    if (!decoded || typeof decoded !== 'object' || !('userId' in decoded) || !('role' in decoded)) {
      res.status(401).json({ error: 'Token non valido o scaduto' })
      return
    }

    req.userId = decoded.userId
    req.userRole = decoded.role
    next()
  } catch {
    res.status(401).json({ error: 'Token non valido o scaduto' })
  }
}