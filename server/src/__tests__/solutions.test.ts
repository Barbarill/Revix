import request from 'supertest'
import { app } from '../index'
import jwt from 'jsonwebtoken'

// ─── Mock Prisma ───────────────────────────────────────────────────────────────
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    solution: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    problem: { findUnique: jest.fn() },
    like: { findUnique: jest.fn(), create: jest.fn(), delete: jest.fn() },
    $transaction: jest.fn(),
  }
  return { PrismaClient: jest.fn(() => mockPrisma) }
})

jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: jest.fn(() => ({})),
}))

import { PrismaClient } from '@prisma/client'
const mockPrisma = new PrismaClient() as jest.Mocked<any>

process.env.JWT_SECRET = 'test_secret'
process.env.DATABASE_URL = 'postgresql://test'

beforeEach(() => jest.clearAllMocks())

// ─── Token e dati fittizi ─────────────────────────────────────────────────────
const token = jwt.sign({ userId: 'user-123', role: 'USER' }, 'test_secret', { expiresIn: '1h' })

const fakeProblem = { id: 'prob-001', title: 'Freni usurati' }

const fakeSolution = {
  id: 'sol-001',
  problem_id: 'prob-001',
  user_id: 'user-123',
  body: 'Sostituire le pastiglie anteriori con quelle originali',
  shop_url: null,
  likes_count: 0,
  user: { id: 'user-123', username: 'andrea', role: 'USER' },
  likes: [],
}

const fakeSolutionConUrl = {
  ...fakeSolution,
  id: 'sol-002',
  shop_url: 'https://shop.example.com/pastiglie',
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/solutions
// ═══════════════════════════════════════════════════════════════════════════════
describe('GET /api/solutions', () => {
  it('SOL-01: restituisce 200 e soluzioni ordinate per likes_count', async () => {
    mockPrisma.solution.findMany.mockResolvedValue([fakeSolution])

    const res = await request(app).get('/api/solutions?problem_id=prob-001')

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(mockPrisma.solution.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { likes_count: 'desc' } })
    )
  })

  it('SOL-01b: restituisce 400 senza problem_id', async () => {
    const res = await request(app).get('/api/solutions')

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/solutions
// ═══════════════════════════════════════════════════════════════════════════════
describe('POST /api/solutions', () => {
  const body = {
    problem_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    body: 'Sostituire le pastiglie anteriori con quelle originali',
  }

  it('SOL-02: restituisce 201 con dati validi', async () => {
    mockPrisma.problem.findUnique.mockResolvedValue(fakeProblem)
    mockPrisma.solution.create.mockResolvedValue(fakeSolution)

    const res = await request(app)
      .post('/api/solutions')
      .set('Authorization', `Bearer ${token}`)
      .send(body)

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.likes_count).toBe(0)
  })

  it('SOL-03: restituisce 201 e salva shop_url se presente', async () => {
    mockPrisma.problem.findUnique.mockResolvedValue(fakeProblem)
    mockPrisma.solution.create.mockResolvedValue(fakeSolutionConUrl)

    const res = await request(app)
      .post('/api/solutions')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...body, shop_url: 'https://shop.example.com/pastiglie' })

    expect(res.status).toBe(201)
    expect(res.body.shop_url).toBe('https://shop.example.com/pastiglie')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/solutions/:id/like
// ═══════════════════════════════════════════════════════════════════════════════
describe('POST /api/solutions/:id/like', () => {
  it('SOL-04: restituisce 200 e incrementa likes_count', async () => {
    mockPrisma.solution.findUnique.mockResolvedValue(fakeSolution)
    mockPrisma.like.findUnique.mockResolvedValue(null)  // nessun like precedente

    const updated = { ...fakeSolution, likes_count: 1 }
    mockPrisma.$transaction.mockImplementation(async (fn: Function) => {
      return fn({
        like: { create: jest.fn() },
        solution: { update: jest.fn().mockResolvedValue(updated) },
      })
    })

    const res = await request(app)
      .post('/api/solutions/sol-001/like')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.likes_count).toBe(1)
  })

  it('SOL-05: restituisce 409 se like già inserito', async () => {
    mockPrisma.solution.findUnique.mockResolvedValue(fakeSolution)
    mockPrisma.like.findUnique.mockResolvedValue({ user_id: 'user-123', solution_id: 'sol-001' })

    const res = await request(app)
      .post('/api/solutions/sol-001/like')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(409)
    expect(res.body.error).toMatch(/già inserito/)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE /api/solutions/:id/like
// ═══════════════════════════════════════════════════════════════════════════════
describe('DELETE /api/solutions/:id/like', () => {
  it('SOL-06: restituisce 200 e decrementa likes_count', async () => {
    mockPrisma.solution.findUnique.mockResolvedValue({ ...fakeSolution, likes_count: 3 })
    mockPrisma.like.findUnique.mockResolvedValue({ user_id: 'user-123', solution_id: 'sol-001' })

    const updated = { ...fakeSolution, likes_count: 2 }
    mockPrisma.$transaction.mockImplementation(async (fn: Function) => {
      return fn({
        like: { delete: jest.fn() },
        solution: { update: jest.fn().mockResolvedValue(updated) },
      })
    })

    const res = await request(app)
      .delete('/api/solutions/sol-001/like')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.likes_count).toBe(2)
  })
})