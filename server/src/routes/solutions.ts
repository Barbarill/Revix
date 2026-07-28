import { Router, Response } from 'express'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware'

const router = Router()
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const solutionSchema = z.object({
  problem_id: z.string().uuid(),
  body: z.string().min(10),
  shop_url: z.string().url().optional().or(z.literal('')),
})

// GET /api/solutions/parts?category=MOTOR
router.get('/parts', async (req: AuthRequest, res: Response): Promise<void> => {
  const { category } = req.query

  try {
    const solutions = await prisma.solution.findMany({
      where: {
        shop_url: { not: null },
        ...(category && {
          problem: { category: category as any },
        }),
      },
      orderBy: { likes_count: 'desc' },
      include: {
        user: { select: { username: true, role: true } },
        problem: {
          select: {
            title: true,
            category: true,
            car: { select: { brand: true, model: true } },
          },
        },
      },
    })
    res.json(solutions)
  } catch (err) {
    console.error('GET PARTS ERROR:', err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// GET /api/solutions?problem_id=xxx&userId=yyy
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { problem_id, userId } = req.query
  if (!problem_id) {
    res.status(400).json({ error: 'problem_id obbligatorio' })
    return
  }
  try {
    const solutions = await prisma.solution.findMany({
      where: { problem_id: String(problem_id) },
      orderBy: { likes_count: 'desc' },
      include: {
        user: { select: { id: true, username: true, role: true } },
        likes: userId
          ? { where: { user_id: String(userId) }, select: { user_id: true } }
          : false,
      },
    })

    const mapped = solutions.map(s => ({
      ...s,
      likedByMe: userId ? s.likes.length > 0 : false,
      likes: undefined,
    }))

    res.json(mapped)
  } catch (err) {
    console.error('GET SOLUTIONS ERROR:', err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// POST /api/solutions
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const result = solutionSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() })
    return
  }

  const { problem_id, body, shop_url } = result.data

  try {
    const problem = await prisma.problem.findUnique({ where: { id: problem_id } })
    if (!problem) {
      res.status(404).json({ error: 'Problema non trovato' })
      return
    }

    const solution = await prisma.solution.create({
      data: {
        problem_id,
        user_id: req.userId!,
        body,
        shop_url: shop_url || null,
      },
      include: {
        user: { select: { id: true, username: true, role: true } },
      },
    })

    res.status(201).json(solution)
  } catch (err) {
    console.error('CREATE SOLUTION ERROR:', err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// POST /api/solutions/:id/like
router.post('/:id/like', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const solutionId = String(req.params.id)
  const userId = req.userId!

  try {
    const solution = await prisma.solution.findUnique({ where: { id: solutionId } })
    if (!solution) {
      res.status(404).json({ error: 'Soluzione non trovata' })
      return
    }

    const existing = await prisma.like.findUnique({
      where: { user_id_solution_id: { user_id: userId, solution_id: solutionId } },
    })
    if (existing) {
      res.status(409).json({ error: 'Like già inserito' })
      return
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.like.create({ data: { user_id: userId, solution_id: solutionId } })
      return tx.solution.update({
        where: { id: solutionId },
        data: { likes_count: solution.likes_count + 1 },
      })
    })

    res.json(updated)
  } catch (err) {
    console.error('LIKE ERROR:', err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// DELETE /api/solutions/:id/like
router.delete('/:id/like', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const solutionId = String(req.params.id)
  const userId = req.userId!

  try {
    const solution = await prisma.solution.findUnique({ where: { id: solutionId } })
    if (!solution) {
      res.status(404).json({ error: 'Soluzione non trovata' })
      return
    }

    const existing = await prisma.like.findUnique({
      where: { user_id_solution_id: { user_id: userId, solution_id: solutionId } },
    })
    if (!existing) {
      res.status(404).json({ error: 'Like non trovato' })
      return
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.like.delete({
        where: { user_id_solution_id: { user_id: userId, solution_id: solutionId } },
      })
      return tx.solution.update({
        where: { id: solutionId },
        data: { likes_count: Math.max(0, solution.likes_count - 1) },
      })
    })

    res.json(updated)
  } catch (err) {
    console.error('UNLIKE ERROR:', err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

export default router