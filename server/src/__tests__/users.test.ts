import request from 'supertest'
import { app } from '../index'
import jwt from 'jsonwebtoken'

// ─── Mock Prisma ───────────────────────────────────────────────────────────────
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: { findUnique: jest.fn(), update: jest.fn() },
    solution: { aggregate: jest.fn(), count: jest.fn() },
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
const tokenMechanic = jwt.sign({ userId: 'mech-001', role: 'MECHANIC' }, 'test_secret', { expiresIn: '1h' })

const fakeUser = {
  id: 'user-123',
  username: 'andrea',
  role: 'USER',
  bio: 'Appassionato di auto',
  avatar: null,
  garage_name: null,
  garage_address: null,
  maps_url: null,
  website: null,
  is_verified: false,
  created_at: new Date(),
  _count: { problems: 3, solutions: 5 },
}

const fakeMechanic = {
  id: 'mech-001',
  username: 'giuseppe',
  role: 'MECHANIC',
  bio: 'Meccanico professionista',
  garage_name: 'Officina Giuseppe',
  garage_address: 'Via Roma 1, Bari',
  maps_url: null,
  website: null,
  is_verified: false,
  created_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), // 100 giorni fa
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/users/:id
// ═══════════════════════════════════════════════════════════════════════════════
describe('GET /api/users/:id', () => {
  it('USER-01: restituisce 200 con dati pubblici e likes_received', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(fakeUser)
    mockPrisma.solution.aggregate.mockResolvedValue({ _sum: { likes_count: 12 } })

    const res = await request(app).get('/api/users/user-123')

    expect(res.status).toBe(200)
    expect(res.body.username).toBe('andrea')
    expect(res.body).toHaveProperty('likes_received', 12)
    expect(res.body._count).toMatchObject({ problems: 3, solutions: 5 })
  })

  it('USER-01b: restituisce 404 per utente inesistente', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)

    const res = await request(app).get('/api/users/id-inesistente')

    expect(res.status).toBe(404)
    expect(res.body).toHaveProperty('error')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// PUT /api/users/me
// ═══════════════════════════════════════════════════════════════════════════════
describe('PUT /api/users/me', () => {
  it('USER-02: restituisce 200 e aggiorna bio', async () => {
    const updated = { ...fakeUser, bio: 'Nuova bio aggiornata', role: 'USER' }
    mockPrisma.user.update.mockResolvedValue(updated)

    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ bio: 'Nuova bio aggiornata' })

    expect(res.status).toBe(200)
    expect(res.body.bio).toBe('Nuova bio aggiornata')
  })

  it('USER-03: is_verified=true per meccanico con tutti i criteri soddisfatti', async () => {
    // update restituisce meccanico con garage compilato
    mockPrisma.user.update.mockResolvedValue(fakeMechanic)
    // 50+ soluzioni
    mockPrisma.solution.count.mockResolvedValue(55)
    // 30+ like ricevuti
    mockPrisma.solution.aggregate.mockResolvedValue({ _sum: { likes_count: 40 } })
    // account creato 100 giorni fa (soddisfa i 90 giorni)
    mockPrisma.user.findUnique.mockResolvedValue({
      created_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
    })

    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${tokenMechanic}`)
      .send({ garage_name: 'Officina Giuseppe', garage_address: 'Via Roma 1, Bari' })

    expect(res.status).toBe(200)
    // Il secondo update (is_verified) deve essere chiamato con true
    expect(mockPrisma.user.update).toHaveBeenLastCalledWith(
      expect.objectContaining({ data: { is_verified: true } })
    )
  })

  it('USER-04: is_verified=false per meccanico con criteri mancanti', async () => {
    // Meccanico con solo garage_name, soluzioni insufficienti
    mockPrisma.user.update.mockResolvedValue({
      ...fakeMechanic,
      garage_address: null,  // criteri non soddisfatti
    })
    mockPrisma.solution.count.mockResolvedValue(5)   // meno di 50
    mockPrisma.solution.aggregate.mockResolvedValue({ _sum: { likes_count: 2 } })
    mockPrisma.user.findUnique.mockResolvedValue({
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),  // solo 10 giorni
    })

    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${tokenMechanic}`)
      .send({ garage_name: 'Officina Giuseppe' })

    expect(res.status).toBe(200)
    expect(mockPrisma.user.update).toHaveBeenLastCalledWith(
      expect.objectContaining({ data: { is_verified: false } })
    )
  })
})