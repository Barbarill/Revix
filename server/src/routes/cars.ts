import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const router = Router()
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// GET /api/cars?brand=Fiat&model=Panda&year=2010
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { brand, model, year } = req.query

  try {
    const cars = await prisma.car.findMany({
      where: {
        ...(brand && { brand: { contains: brand as string, mode: 'insensitive' } }),
        ...(model && { model: { contains: model as string, mode: 'insensitive' } }),
        ...(year && {
          year_from: { lte: parseInt(year as string) },
          OR: [
            { year_to: null },
            { year_to: { gte: parseInt(year as string) } },
          ],
        }),
      },
      orderBy: [{ brand: 'asc' }, { model: 'asc' }],
    })
    res.json(cars)
  } catch (err) {
    console.error('CARS ERROR:', err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// GET /api/cars/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const car = await prisma.car.findUnique({
      where: { id: String(req.params.id) },
      include: {
        _count: {
          select: { problems: true },
        },
        problems: {
          select: { user_id: true },                    // ← per calcolare utenti unici
        },
      },
    })
    if (!car) {
      res.status(404).json({ error: 'Auto non trovata' })
      return
    }

    // Calcola utenti unici e soluzioni
    const uniqueUsers = new Set(car.problems.map(p => p.user_id)).size
    const solutionsCount = await prisma.solution.count({
      where: { problem: { car_id: String(req.params.id) } },
    })

    res.json({
      ...car,
      problems: undefined,                             // ← non esporre la lista raw
      _count: {
        problems: car._count.problems,
        solutions: solutionsCount,
        users: uniqueUsers,
      },
    })
  } catch (err) {
    console.error('CAR DETAIL ERROR:', err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// GET /api/cars/:id/problems
router.get('/:id/problems', async (req: Request, res: Response): Promise<void> => {
  const userId = req.query.userId as string | undefined

  try {
    const problems = await prisma.problem.findMany({
      where: { car_id: String(req.params.id) },
      orderBy: { confirm_count: 'desc' },
      include: {
        user: { select: { id: true, username: true, role: true } },
        confirms: userId
          ? { where: { user_id: userId }, select: { user_id: true } }
          : false,
      },
    })

    const mapped = problems.map(p => ({
      ...p,
      confirmedByMe: userId ? p.confirms.length > 0 : false,
      confirms: undefined,
    }))

    const official = mapped.filter(p => p.is_official)
    const pending = mapped.filter(p => !p.is_official)

    res.json({ official, pending })
  } catch (err) {
    console.error('CAR PROBLEMS ERROR:', err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

export default router