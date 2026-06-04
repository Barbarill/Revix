import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware'

const router = Router()
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(3),
  role: z.enum(['USER', 'MECHANIC']).default('USER'),
  garage_name: z.string().optional(),
  garage_address: z.string().optional(),
  maps_url: z.string().url().optional(),
  website: z.string().url().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const result = registerSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() })
    return
  }

  const { email, password, username, role, garage_name, garage_address, maps_url, website } = result.data

  try {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    })
    if (existing) {
      res.status(409).json({ error: 'Email o username già in uso' })
      return
    }

    const password_hash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
              email,
              password_hash,
              username,
              role,
              garage_name: garage_name ?? null,
              garage_address: garage_address ?? null,
              maps_url: maps_url ?? null,
              website: website ?? null,
            },
    })

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    )

    res.status(201).json({ token, user: { id: user.id, email: user.email, username: user.username, role: user.role } })
  } catch (err) {
      console.error('REGISTER ERROR:', err)
      res.status(500).json({ error: 'Errore interno del server' })
  }
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const result = loginSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() })
    return
  }

  const { email, password } = result.data

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      res.status(401).json({ error: 'Credenziali non valide' })
      return
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      res.status(401).json({ error: 'Credenziali non valide' })
      return
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    )

    res.json({ token, user: { id: user.id, email: user.email, username: user.username, role: user.role } })
  } catch (err) {
      console.error('REGISTER ERROR:', err)
      res.status(500).json({ error: 'Errore interno del server' })
  }
})

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { id: true, email: true, username: true, role: true, bio: true, avatar: true,
                garage_name: true, garage_address: true, maps_url: true, website: true,
                is_verified: true, created_at: true },
    })
    if (!user) {
      res.status(404).json({ error: 'Utente non trovato' })
      return
    }
    res.json(user)
  } catch (err) {
      console.error('REGISTER ERROR:', err)
      res.status(500).json({ error: 'Errore interno del server' })
  }
})

export default router