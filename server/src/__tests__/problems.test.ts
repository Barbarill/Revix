import request from 'supertest'
import { app } from '../index'
import jwt from 'jsonwebtoken'

// ─── Mock Prisma ───────────────────────────────────────────────────────────────
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    car: { findUnique: jest.fn() },
    problem: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
    confirm: { findUnique: jest.fn(), create: jest.fn(), delete: jest.fn() },
    user: { findUnique: jest.fn() },
    notification: { create: jest.fn() },
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
const tokenUtente = jwt.sign({ userId: 'user-123', role: 'USER' }, 'test_secret', { expiresIn: '1h' })
const tokenAltro  = jwt.sign({ userId: 'user-456', role: 'USER' }, 'test_secret', { expiresIn: '1h' })

const fakeCar = { id: 'car-001', brand: 'Fiat', model: 'Punto' }

const fakeProblem = {
  id: 'prob-001',
  car_id: 'car-001',
  user_id: 'user-123',   // proprietario
  title: 'Freni usurati',
  description: 'I freni anteriori sono usurati da mesi',
  category: 'BRAKES',
  confirm_count: 0,
  is_official: false,
  created_at: new Date(),
}

const fakeProblemQuasiUfficiale = { ...fakeProblem, confirm_count: 4 }

const fakeProblemCreato = {
  ...fakeProblem,
  user: { id: 'user-123', username: 'andrea', role: 'USER' },
}

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/problems
// ═══════════════════════════════════════════════════════════════════════════════
describe('POST /api/problems', () => {
  const body = {
    car_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    title: 'Freni usurati',
    description: 'I freni anteriori sono usurati da mesi',
    category: 'BRAKES',
    }

  it('PROB-01: restituisce 201 con dati validi e token', async () => {
    mockPrisma.car.findUnique.mockResolvedValue(fakeCar)
    mockPrisma.problem.create.mockResolvedValue(fakeProblemCreato)

    const res = await request(app)
        .post('/api/problems')
        .set('Authorization', `Bearer ${tokenUtente}`)
        .send(body)

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.confirm_count).toBe(0)
  })

  it('PROB-02: restituisce 401 senza token', async () => {
    const res = await request(app).post('/api/problems').send(body)

    expect(res.status).toBe(401)
  })

  it('PROB-03: restituisce 400 con categoria non valida', async () => {
    const res = await request(app)
      .post('/api/problems')
      .set('Authorization', `Bearer ${tokenUtente}`)
      .send({ ...body, category: 'INVALID' })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/problems/recent
// ═══════════════════════════════════════════════════════════════════════════════
describe('GET /api/problems/recent', () => {
  it('PROB-09: restituisce 200 e array di problemi recenti', async () => {
    mockPrisma.problem.findMany.mockResolvedValue([fakeProblem])

    const res = await request(app).get('/api/problems/recent')

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(mockPrisma.problem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 20, orderBy: { created_at: 'desc' } })
    )
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/problems/:id/confirm
// ═══════════════════════════════════════════════════════════════════════════════
describe('POST /api/problems/:id/confirm', () => {
  it('PROB-04: restituisce 200 e incrementa confirm_count', async () => {
    mockPrisma.problem.findUnique.mockResolvedValue(fakeProblem)   // proprietario: user-123
    mockPrisma.confirm.findUnique.mockResolvedValue(null)           // nessuna conferma precedente
    mockPrisma.user.findUnique.mockResolvedValue({ username: 'mario' })

    const updated = { ...fakeProblem, confirm_count: 1 }
    mockPrisma.$transaction.mockImplementation(async (fn: Function) => {
      return fn({
        confirm: { create: jest.fn() },
        problem: { update: jest.fn().mockResolvedValue(updated) },
        notification: { create: jest.fn() },
      })
    })

    const res = await request(app)
      .post('/api/problems/prob-001/confirm')
      .set('Authorization', `Bearer ${tokenAltro}`)  // user-456 conferma il problema di user-123

    expect(res.status).toBe(200)
    expect(res.body.confirm_count).toBe(1)
  })

  it('PROB-05: restituisce 400 se il proprietario conferma il proprio problema', async () => {
    mockPrisma.problem.findUnique.mockResolvedValue(fakeProblem)   // proprietario: user-123

    const res = await request(app)
      .post('/api/problems/prob-001/confirm')
      .set('Authorization', `Bearer ${tokenUtente}`)  // user-123 = stesso proprietario

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/tuo stesso problema/)
  })

  it('PROB-06: restituisce 409 se utente ha già confermato', async () => {
    mockPrisma.problem.findUnique.mockResolvedValue(fakeProblem)
    mockPrisma.confirm.findUnique.mockResolvedValue({ user_id: 'user-456', problem_id: 'prob-001' })

    const res = await request(app)
      .post('/api/problems/prob-001/confirm')
      .set('Authorization', `Bearer ${tokenAltro}`)

    expect(res.status).toBe(409)
    expect(res.body.error).toMatch(/già confermato/)
  })

  it('PROB-07: is_official diventa true alla quinta conferma', async () => {
    mockPrisma.problem.findUnique.mockResolvedValue(fakeProblemQuasiUfficiale)  // confirm_count=4
    mockPrisma.confirm.findUnique.mockResolvedValue(null)
    mockPrisma.user.findUnique.mockResolvedValue({ username: 'mario' })

    const updated = { ...fakeProblemQuasiUfficiale, confirm_count: 5, is_official: true }
    mockPrisma.$transaction.mockImplementation(async (fn: Function) => {
      return fn({
        confirm: { create: jest.fn() },
        problem: { update: jest.fn().mockResolvedValue(updated) },
        notification: { create: jest.fn() },
      })
    })

    const res = await request(app)
      .post('/api/problems/prob-001/confirm')
      .set('Authorization', `Bearer ${tokenAltro}`)

    expect(res.status).toBe(200)
    expect(res.body.confirm_count).toBe(5)
    expect(res.body.is_official).toBe(true)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE /api/problems/:id/confirm
// ═══════════════════════════════════════════════════════════════════════════════
describe('DELETE /api/problems/:id/confirm', () => {
  it('PROB-08: restituisce 200 e decrementa confirm_count', async () => {
    mockPrisma.confirm.findUnique.mockResolvedValue({ user_id: 'user-456', problem_id: 'prob-001' })
    mockPrisma.problem.findUnique.mockResolvedValue({ ...fakeProblem, confirm_count: 3 })

    const updated = { ...fakeProblem, confirm_count: 2 }
    mockPrisma.$transaction.mockImplementation(async (fn: Function) => {
      return fn({
        confirm: { delete: jest.fn() },
        problem: { update: jest.fn().mockResolvedValue(updated) },
      })
    })

    const res = await request(app)
      .delete('/api/problems/prob-001/confirm')
      .set('Authorization', `Bearer ${tokenAltro}`)

    expect(res.status).toBe(200)
    expect(res.body.confirm_count).toBe(2)
  })
})