import request from 'supertest'
import { app } from '../index'
import jwt from 'jsonwebtoken'

// ─── Mock Prisma ───────────────────────────────────────────────────────────────
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    notification: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
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

// ─── Token e dati fittizi ─────────────────────────────────────────────────────
const token = jwt.sign({ userId: 'user-123', role: 'USER' }, 'test_secret', { expiresIn: '1h' })

const fakeNotification = {
  id: 'notif-001',
  user_id: 'user-123',
  sender_id: 'user-456',
  problem_id: 'prob-001',
  message: 'mario ha confermato il tuo problema: "Freni usurati"',
  is_read: false,
  created_at: new Date(),
  sender: { username: 'mario', role: 'USER' },
  problem: { id: 'prob-001', title: 'Freni usurati', car_id: 'car-001' },
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/notifications
// ═══════════════════════════════════════════════════════════════════════════════
describe('GET /api/notifications', () => {
  it('NOTIF-01: restituisce 200 e notifiche utente con token valido', async () => {
    mockPrisma.notification.findMany.mockResolvedValue([fakeNotification])

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body[0].id).toBe('notif-001')
  })

  it('NOTIF-02: restituisce 401 senza token', async () => {
    const res = await request(app).get('/api/notifications')

    expect(res.status).toBe(401)
    expect(mockPrisma.notification.findMany).not.toHaveBeenCalled()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// PATCH /api/notifications/read-all
// ═══════════════════════════════════════════════════════════════════════════════
describe('PATCH /api/notifications/read-all', () => {
  it('NOTIF-03: restituisce 200 e segna tutte le notifiche come lette', async () => {
    mockPrisma.notification.updateMany.mockResolvedValue({ count: 2 })

    const res = await request(app)
      .patch('/api/notifications/read-all')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true })
    expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ user_id: 'user-123', is_read: false }),
        data: { is_read: true },
      })
    )
  })
})