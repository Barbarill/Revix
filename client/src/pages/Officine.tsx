import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'

interface Mechanic {
  id: string
  username: string
  bio: string | null
  garage_name: string | null
  garage_address: string | null
  maps_url: string | null
  website: string | null
  is_verified: boolean
  _count: { solutions: number }
}

export default function Officine() {
  const [city, setCity] = useState('')
  const [cityFilter, setCityFilter] = useState('')

  const { data: mechanics, isLoading } = useQuery<Mechanic[]>({
    queryKey: ['mechanics', cityFilter],
    queryFn: async () => {
      const params: Record<string, string> = { role: 'MECHANIC' }
      if (cityFilter.trim()) params.city = cityFilter.trim()
      return (await api.get('/users', { params })).data
    },
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCityFilter(city)
  }

  const verified   = mechanics?.filter(m => m.is_verified)   ?? []
  const unverified = mechanics?.filter(m => !m.is_verified)  ?? []

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'var(--color-background-secondary)',
        borderBottom: '0.5px solid var(--color-border-tertiary)',
        padding: '24px 20px 16px',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>Officine e meccanici</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
            Meccanici verificati dalla community di Revix
          </p>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="Cerca per città (es. Roma, Milano...)"
              style={{
                flex: 1, padding: '8px 12px',
                borderRadius: 'var(--border-radius-md)',
                border: '0.5px solid var(--color-border-secondary)',
                background: 'var(--color-background-primary)',
                fontSize: 13, color: 'var(--color-text-primary)', outline: 'none',
              }}
            />
            <button type="submit" style={{
              padding: '8px 16px', borderRadius: 'var(--border-radius-md)',
              background: 'var(--color-accent)', color: '#fff',
              border: 'none', fontSize: 13, cursor: 'pointer', fontWeight: 500,
            }}>
              Cerca
            </button>
          </form>
        </div>
      </div>

      {/* Contenuto */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '16px 20px' }}>
        {isLoading && (
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Caricamento...</p>
        )}

        {!isLoading && mechanics?.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Nessun meccanico trovato{cityFilter ? ` a "${cityFilter}"` : ''}.
          </p>
        )}

        {/* Verificati */}
        {verified.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              ✅ Meccanici verificati
              <span style={{ fontSize: 11, background: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)', padding: '1px 6px', borderRadius: 20 }}>
                {verified.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {verified.map(m => <MechanicCard key={m.id} mechanic={m} />)}
            </div>
          </div>
        )}

        {/* Non verificati */}
        {unverified.length > 0 && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              🔧 Altri meccanici
              <span style={{ fontSize: 11, background: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)', padding: '1px 6px', borderRadius: 20 }}>
                {unverified.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {unverified.map(m => <MechanicCard key={m.id} mechanic={m} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MechanicCard({ mechanic: m }: { mechanic: Mechanic }) {
  return (
    <div style={{
      background: 'var(--color-background-primary)',
      border: '0.5px solid var(--color-border-tertiary)',
      borderRadius: 'var(--border-radius-lg)',
      padding: '12px 14px',
      display: 'flex', gap: 14, alignItems: 'flex-start',
    }}>
      {/* Avatar placeholder */}
      <div style={{
        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
        background: 'var(--color-background-secondary)',
        border: '0.5px solid var(--color-border-tertiary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18,
      }}>
        🔧
      </div>

      {/* Info */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <Link to={`/profile/${m.id}`} style={{
            fontSize: 14, fontWeight: 500,
            color: 'var(--color-text-primary)', textDecoration: 'none',
          }}>
            {m.garage_name ?? m.username}
          </Link>
          {m.is_verified && (
            <span style={{
              fontSize: 10, padding: '1px 6px', borderRadius: 10,
              background: '#E1F5EE', color: '#0F6E56', fontWeight: 500,
            }}>
              ✓ Verificato
            </span>
          )}
          <span style={{
            fontSize: 10, padding: '1px 6px', borderRadius: 10,
            background: 'var(--color-purple-light)', color: 'var(--color-purple)', fontWeight: 500,
          }}>
            Meccanico
          </span>
        </div>

        {m.garage_address && (
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
            📍 {m.garage_address}
          </div>
        )}

        {m.bio && (
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 6 }}>
            {m.bio}
          </p>
        )}

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            💡 {m._count.solutions} soluzioni
          </span>
          {m.maps_url && (
            <a href={m.maps_url} target="_blank" rel="noopener noreferrer" style={{
              fontSize: 12, color: '#185FA5', textDecoration: 'none',
            }}>
              🗺️ Mappa
            </a>
          )}
          {m.website && (
            <a href={m.website} target="_blank" rel="noopener noreferrer" style={{
              fontSize: 12, color: '#185FA5', textDecoration: 'none',
            }}>
              🌐 Sito
            </a>
          )}
        </div>
      </div>
    </div>
  )
}