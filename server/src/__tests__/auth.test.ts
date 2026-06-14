import request from 'supertest'
import { app } from '../index'

// Mock di Prisma: nessun DB reale durante i test
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  }
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  }
})

// Mock dell'adapter PG (non serve una connessione reale)
jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: jest.fn(() => ({})),
}))

// Mock di bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}))

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Riferimento all'istanza mockata di Prisma usata dalla route
const mockPrisma = new PrismaClient() as jest.Mocked<any>

// JWT_SECRET deve esistere durante i test
process.env.JWT_SECRET = 'test_secret'
process.env.DATABASE_URL = 'postgresql://test'

// ─────────────────────────────────────────────
// Helper: utente fittizio restituito dal mock
// ─────────────────────────────────────────────
const fakeUser = {
  id: 'user-123',
  email: 'andrea@test.com',
  username: 'andrea',
  role: 'USER',
  password_hash: 'hashed_password',
  bio: null,
  avatar: null,
  garage_name: null,
  garage_address: null,
  maps_url: null,
  website: null,
  is_verified: false,
  created_at: new Date(),
}

// ─────────────────────────────────────────────
// Reset dei mock prima di ogni test
// ─────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks()
})

// ═════════════════════════════════════════════
// AUTH-01 — Registrazione utente valido
// ═════════════════════════════════════════════
describe('POST /api/auth/register', () => {
  it('AUTH-01: restituisce 201 e token con dati validi', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null)   // nessun duplicato
    mockPrisma.user.create.mockResolvedValue(fakeUser)

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'andrea@test.com', password: 'password123', username: 'andrea' })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('token')
    expect(res.body.user).toMatchObject({ email: 'andrea@test.com', username: 'andrea' })
  })

  // AUTH-02 — Email duplicata
  it('AUTH-02: restituisce 409 se email già in uso', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(fakeUser)  // duplicato trovato

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'andrea@test.com', password: 'password123', username: 'andrea' })

    expect(res.status).toBe(409)
    expect(res.body).toHaveProperty('error')
  })

  // AUTH-03 — Dati mancanti (password assente)
  it('AUTH-03: restituisce 400 se password mancante', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'andrea@test.com', username: 'andrea' })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })
})

// ═════════════════════════════════════════════
// POST /api/auth/login
// ═════════════════════════════════════════════
describe('POST /api/auth/login', () => {
  it('AUTH-04: restituisce 200 e token con credenziali corrette', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(fakeUser)
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'andrea@test.com', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
    expect(res.body.user.email).toBe('andrea@test.com')
  })

  it('AUTH-05: restituisce 401 con password errata', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(fakeUser)
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'andrea@test.com', password: 'sbagliata' })

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Credenziali non valide')
  })
})

// ═════════════════════════════════════════════
// GET /api/auth/me
// ═════════════════════════════════════════════
describe('GET /api/auth/me', () => {
  // Genera un token JWT valido da usare negli header
  const jwt = require('jsonwebtoken')
  const validToken = jwt.sign(
    { userId: 'user-123', role: 'USER' },
    'test_secret',
    { expiresIn: '1h' }
  )

  it('AUTH-06: restituisce 200 e dati utente con token valido', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(fakeUser)

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${validToken}`)

    expect(res.status).toBe(200)
    expect(res.body.email).toBe('andrea@test.com')
  })

  it('AUTH-07: restituisce 401 senza token', async () => {
    const res = await request(app).get('/api/auth/me')

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Token mancante')
  })
})