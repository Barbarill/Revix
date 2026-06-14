import request from 'supertest'
import { app } from '../index'

// ─── Mock Prisma ───────────────────────────────────────────────────────────────
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    car: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    problem: {
      findMany: jest.fn(),
    },
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

// ─── Dati fittizi ──────────────────────────────────────────────────────────────
const fakeCar = {
  id: 'car-001',
  brand: 'Fiat',
  model: 'Punto',
  year_from: 2005,
  year_to: 2015,
  engine: '1.2',
  fuel: 'benzina',
  _count: { problems: 3 },
}

const fakeProblems = [
  {
    id: 'prob-001',
    title: 'Freni usurati',
    description: 'I freni anteriori sono usurati',
    category: 'FRENI',
    car_id: 'car-001',
    user_id: 'user-123',
    confirm_count: 6,
    is_official: true,
    user: { id: 'user-123', username: 'andrea', role: 'USER' },
    confirms: [],
  },
  {
    id: 'prob-002',
    title: 'Spia motore accesa',
    description: 'Spia gialla accesa dopo 50km',
    category: 'MOTORE',
    car_id: 'car-001',
    user_id: 'user-456',
    confirm_count: 1,
    is_official: false,
    user: { id: 'user-456', username: 'mario', role: 'USER' },
    confirms: [],
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/cars
// ═══════════════════════════════════════════════════════════════════════════════
describe('GET /api/cars', () => {
  it('CAR-01: restituisce 200 e array di auto senza filtri', async () => {
    mockPrisma.car.findMany.mockResolvedValue([fakeCar])

    const res = await request(app).get('/api/cars')

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })

  it('CAR-02: restituisce 200 filtrando per brand', async () => {
    mockPrisma.car.findMany.mockResolvedValue([fakeCar])

    const res = await request(app).get('/api/cars?brand=Fiat')

    expect(res.status).toBe(200)
    // Verifica che findMany sia stato chiamato con il filtro brand
    expect(mockPrisma.car.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          brand: expect.objectContaining({ contains: 'Fiat' }),
        }),
      })
    )
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/cars/:id
// ═══════════════════════════════════════════════════════════════════════════════
describe('GET /api/cars/:id', () => {
  it('CAR-03: restituisce 200 e oggetto auto con ID valido', async () => {
    mockPrisma.car.findUnique.mockResolvedValue(fakeCar)

    const res = await request(app).get('/api/cars/car-001')

    expect(res.status).toBe(200)
    expect(res.body.id).toBe('car-001')
    expect(res.body.brand).toBe('Fiat')
  })

  it('CAR-04: restituisce 404 con ID inesistente', async () => {
    mockPrisma.car.findUnique.mockResolvedValue(null)

    const res = await request(app).get('/api/cars/id-inesistente')

    expect(res.status).toBe(404)
    expect(res.body).toHaveProperty('error')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/cars/:id/problems
// ═══════════════════════════════════════════════════════════════════════════════
describe('GET /api/cars/:id/problems', () => {
  it('CAR-05: restituisce 200 con problemi divisi in official e pending', async () => {
    mockPrisma.problem.findMany.mockResolvedValue(fakeProblems)

    const res = await request(app).get('/api/cars/car-001/problems')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('official')
    expect(res.body).toHaveProperty('pending')
    // prob-001 ha is_official=true → official; prob-002 → pending
    expect(res.body.official).toHaveLength(1)
    expect(res.body.pending).toHaveLength(1)
    expect(res.body.official[0].id).toBe('prob-001')
    expect(res.body.pending[0].id).toBe('prob-002')
  })
})