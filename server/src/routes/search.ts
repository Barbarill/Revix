import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const router = Router()

function getClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter } as any)
}

// GET /api/search?q=termineRicerca
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const q = (req.query.q as string)?.trim()

  if (!q || q.length < 2) {
    res.json({ cars: [], problems: [] })
    return
  }

  const prisma = getClient()

  try {
    const [cars, problems] = await Promise.all([
      prisma.car.findMany({
        where: {
          OR: [
            { brand: { contains: q, mode: 'insensitive' } },
            { model: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
        orderBy: { brand: 'asc' },
      }),
      prisma.problem.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 8,
        include: {
          car: { select: { brand: true, model: true } },
          user: { select: { username: true, role: true } },
        },
        orderBy: { confirm_count: 'desc' },
      }),
    ])

    res.json({ cars, problems })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Errore nella ricerca' })
  } finally {
    await prisma.$disconnect()
  }
})

export default router