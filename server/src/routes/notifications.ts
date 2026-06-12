import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware'

const router = Router()
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// GET /api/notifications — lista notifiche dell'utente loggato
router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { user_id: req.userId! },
      orderBy: { created_at: 'desc' },
      take: 20,
      include: {
        sender: { select: { username: true, role: true } },
        problem: { select: { id: true, title: true, car_id: true } },
      },
    })
    res.json(notifications)
  } catch (err) {
    console.error('GET NOTIFICATIONS ERROR:', err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// PATCH /api/notifications/read-all — segna tutte come lette
router.patch('/read-all', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.notification.updateMany({
      where: { user_id: req.userId!, is_read: false },
      data: { is_read: true },
    })
    res.json({ ok: true })
  } catch (err) {
    console.error('READ ALL ERROR:', err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

export default router