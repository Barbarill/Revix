import { Router, Response } from 'express'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware'

const router = Router()
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// GET /api/users/:id
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: String(req.params.id) },
      select: {
        id: true, username: true, role: true, bio: true,
        avatar: true, garage_name: true, garage_address: true,
        maps_url: true, website: true, is_verified: true, created_at: true,
        _count: {
          select: { problems: true, solutions: true }
        },
      },
    })

    if (!user) {
      res.status(404).json({ error: 'Utente non trovato' })
      return
    }

    // Calcola totale like ricevuti sulle soluzioni
    const likesReceived = await prisma.solution.aggregate({
      where: { user_id: String(req.params.id) },
      _sum: { likes_count: true },
    })

    res.json({
      ...user,
      likes_received: likesReceived._sum?.likes_count ?? 0,
    })
  } catch (err) {
    console.error('GET USER ERROR:', err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// PUT /api/users/me
const updateSchema = z.object({
  bio: z.string().max(300).optional(),
  garage_name: z.string().optional(),
  garage_address: z.string().optional(),
  maps_url: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
})

router.put('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const result = updateSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() })
    return
  }

  const { bio, garage_name, garage_address, maps_url, website } = result.data

  try {
    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: {
        bio: bio ?? undefined,
        garage_name: garage_name ?? undefined,
        garage_address: garage_address ?? undefined,
        maps_url: maps_url || null,
        website: website || null,
      },
      select: {
        id: true, username: true, role: true, bio: true,
        garage_name: true, garage_address: true,
        maps_url: true, website: true, is_verified: true,
      },
    })

    // Ricalcola is_verified per meccanici
    if (user.role === 'MECHANIC') {
      const solutionCount = await prisma.solution.count({ where: { user_id: req.userId! } })
      const likesReceived = await prisma.solution.aggregate({
        where: { user_id: req.userId! },
        _sum: { likes_count: true },
      })
      const accountAge = await prisma.user.findUnique({
        where: { id: req.userId! },
        select: { created_at: true },
      })

      const daysSinceCreation = accountAge
        ? Math.floor((Date.now() - accountAge.created_at.getTime()) / (1000 * 60 * 60 * 24))
        : 0

      const isVerified =
        !!user.garage_name &&
        !!user.garage_address &&
        solutionCount >= 50 &&
        (likesReceived._sum.likes_count ?? 0) >= 30 &&
        daysSinceCreation >= 90

      await prisma.user.update({
        where: { id: req.userId! },
        data: { is_verified: isVerified },
      })
    }

    res.json(user)
  } catch (err) {
    console.error('UPDATE USER ERROR:', err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

export default router