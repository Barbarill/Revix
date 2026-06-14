import request from 'supertest'
import { app } from '../index'

// ─── Mock Prisma ───────────────────────────────────────────────────────────────
// Le funzioni mock devono stare DENTRO il factory, non fuori
// perché jest.mock() viene eseguito prima delle dichiarazioni const
jest.mock('@prisma/client', () => {
  const mockFindManyCars = jest.fn()
  const mockFindManyProblems = jest.fn()
  const mockDisconnect = jest.fn().mockResolvedValue(undefined)

  const MockPrismaClient = jest.fn(() => ({
    car: { findMany: mockFindManyCars },
    problem: { findMany: mockFindManyProblems },
    $disconnect: mockDisconnect,
  }))

  // Esponiamo i mock sull'istanza così possiamo accederci nei test
  ;(MockPrismaClient as any).__mocks = {
    mockFindManyCars,
    mockFindManyProblems,
    mockDisconnect,
  }

  return { PrismaClient: MockPrismaClient }
})

jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: jest.fn(() => ({})),
}))

import { PrismaClient } from '@prisma/client'

process.env.JWT_SECRET = 'test_secret'
process.env.DATABASE_URL = 'postgresql://test'

// Recupera i mock esposti dal factory
const { mockFindManyCars, mockFindManyProblems } = (PrismaClient as any).__mocks

beforeEach(() => jest.clearAllMocks())

// ─── Dati fittizi ─────────────────────────────────────────────────────────────
const fakeCar = { id: 'car-001', brand: 'Fiat', model: 'Punto', year_from: 2005, year_to: 2015 }
const fakeProblem = {
  id: 'prob-001',
  title: 'Freni usurati',
  description: 'I freni anteriori sono da sostituire',
  confirm_count: 3,
  car: { brand: 'Fiat', model: 'Punto' },
  user: { username: 'andrea', role: 'USER' },
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/search
// ═══════════════════════════════════════════════════════════════════════════════
describe('GET /api/search', () => {
  it('SEARCH-01: restituisce 200 con risultati per termine valido', async () => {
    mockFindManyCars.mockResolvedValue([fakeCar])
    mockFindManyProblems.mockResolvedValue([])

    const res = await request(app).get('/api/search?q=fiat')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('cars')
    expect(res.body).toHaveProperty('problems')
    expect(res.body.cars.length).toBeGreaterThan(0)
  })

  it('SEARCH-02: ricerca case-insensitive — trova risultati in maiuscolo', async () => {
    mockFindManyCars.mockResolvedValue([fakeCar])
    mockFindManyProblems.mockResolvedValue([])

    const res = await request(app).get('/api/search?q=VOLKSWAGEN')

    expect(res.status).toBe(200)
    expect(mockFindManyCars).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ brand: expect.objectContaining({ mode: 'insensitive' }) }),
          ]),
        }),
      })
    )
  })

  it('SEARCH-03: trova problemi per titolo', async () => {
    mockFindManyCars.mockResolvedValue([])
    mockFindManyProblems.mockResolvedValue([fakeProblem])

    const res = await request(app).get('/api/search?q=freni')

    expect(res.status).toBe(200)
    expect(res.body.problems.length).toBeGreaterThan(0)
    expect(res.body.problems[0].id).toBe('prob-001')
  })

  it('SEARCH-04: restituisce array vuoti per termine troppo corto', async () => {
    const res = await request(app).get('/api/search?q=f')

    expect(res.status).toBe(200)
    expect(res.body.cars).toHaveLength(0)
    expect(res.body.problems).toHaveLength(0)
    expect(mockFindManyCars).not.toHaveBeenCalled()
  })

  it('SEARCH-05: restituisce array vuoti senza parametro q', async () => {
    const res = await request(app).get('/api/search')

    expect(res.status).toBe(200)
    expect(res.body.cars).toHaveLength(0)
    expect(res.body.problems).toHaveLength(0)
    expect(mockFindManyCars).not.toHaveBeenCalled()
  })
})