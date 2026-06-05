import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware'

const router = Router()
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const problemSchema = z.object({
  car_id: z.string().uuid(),
  title: z.string().min(5),
  description: z.string().min(10),
  category: z.enum(['MOTOR', 'BODYWORK', 'ELECTRONICS', 'BRAKES', 'SUSPENSION']),
})

// POST /api/problems
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const result = problemSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() })
    return
  }

  const { car_id, title, description, category } = result.data

  try {
    const car = await prisma.car.findUnique({ where: { id: car_id } })
    if (!car) {
      res.status(404).json({ error: 'Auto non trovata' })
      return
    }

    const problem = await prisma.problem.create({
      data: {
        car_id,
        user_id: req.userId!,
        title,
        description,
        category,
      },
      include: {
        user: { select: { id: true, username: true, role: true } },
      },
    })

    res.status(201).json(problem)
  } catch (err) {
    console.error('CREATE PROBLEM ERROR:', err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// GET /api/problems/recent
router.get('/recent', async (req: Request, res: Response): Promise<void> => {
  try {
    const problems = await prisma.problem.findMany({
      take: 20,
      orderBy: { created_at: 'desc' },
      include: {
        car: { select: { brand: true, model: true } },
        user: { select: { username: true, role: true } },
      },
    })
    res.json(problems)
  } catch (err) {
    console.error('RECENT PROBLEMS ERROR:', err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// POST /api/problems/:id/confirm
router.post('/:id/confirm', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const problemId = String(req.params.id)
  const userId = req.userId!

  try {
    const problem = await prisma.problem.findUnique({ where: { id: problemId } })
    if (!problem) {
      res.status(404).json({ error: 'Problema non trovato' })
      return
    }

    // Controlla se l'utente ha già confermato
    const existing = await prisma.confirm.findUnique({
      where: { user_id_problem_id: { user_id: userId, problem_id: problemId } },
    })
    if (existing) {
      res.status(409).json({ error: 'Hai già confermato questo problema' })
      return
    }

    // Crea la conferma e aggiorna il contatore in una transazione
    const updatedProblem = await prisma.$transaction(async (tx) => {
      await tx.confirm.create({
        data: { user_id: userId, problem_id: problemId },
      })

      const newCount = problem.confirm_count + 1

      return tx.problem.update({
        where: { id: problemId },
        data: {
          confirm_count: newCount,
          is_official: newCount >= 5,
        },
      })
    })

    res.json(updatedProblem)
  } catch (err) {
    console.error('CONFIRM ERROR:', err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// DELETE /api/problems/:id/confirm
router.delete('/:id/confirm', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const problemId = String(req.params.id)
  const userId = req.userId!

  try {
    const existing = await prisma.confirm.findUnique({
      where: { user_id_problem_id: { user_id: userId, problem_id: problemId } },
    })
    if (!existing) {
      res.status(404).json({ error: 'Conferma non trovata' })
      return
    }

    const problem = await prisma.problem.findUnique({ where: { id: problemId } })
    if (!problem) {
      res.status(404).json({ error: 'Problema non trovato' })
      return
    }

    const updatedProblem = await prisma.$transaction(async (tx) => {
      await tx.confirm.delete({
        where: { user_id_problem_id: { user_id: userId, problem_id: problemId } },
      })

      const newCount = Math.max(0, problem.confirm_count - 1)

      return tx.problem.update({
        where: { id: problemId },
        data: {
          confirm_count: newCount,
          is_official: newCount >= 5,
        },
      })
    })

    res.json(updatedProblem)
  } catch (err) {
    console.error('UNCONFIRM ERROR:', err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

export default router