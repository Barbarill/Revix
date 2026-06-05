import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'

interface UserProfile {
  id: string
  username: string
  role: 'USER' | 'MECHANIC'
  bio: string | null
  garage_name: string | null
  garage_address: string | null
  maps_url: string | null
  website: string | null
  is_verified: boolean
  created_at: string
  likes_received: number
  _count: { problems: number; solutions: number }
}

export default function Profile() {
  const { id } = useParams()

  const { data: user, isLoading } = useQuery<UserProfile>({
    queryKey: ['user', id],
    queryFn: async () => (await api.get(`/users/${id}`)).data,
  })

  if (isLoading) return <p style={{ padding: 20, fontSize: 13, color: 'var(--color-text-secondary)' }}>Caricamento...</p>
  if (!user) return <p style={{ padding: 20, fontSize: 13, color: 'var(--color-text-secondary)' }}>Utente non trovato.</p>

  const joinedDate = new Date(user.created_at).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
  const storedUser = localStorage.getItem('user')
  const me = storedUser ? JSON.parse(storedUser) : null
  const isMe = me?.id === user.id

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px' }}>

      {/* Card profilo */}
      <div style={{
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: 'var(--border-radius-lg)', padding: 20, marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          {/* Avatar */}
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'var(--color-background-secondary)',
            border: '0.5px solid var(--color-border-tertiary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0,
          }}>
            {user.role === 'MECHANIC' ? '🔧' : '👤'}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 17, fontWeight: 500, margin: 0 }}>{user.username}</h1>
              {user.role === 'MECHANIC' && (
                <span style={{ fontSize: 10, background: 'var(--color-purple-light)', color: 'var(--color-purple)', padding: '1px 7px', borderRadius: 10, fontWeight: 500 }}>
                  Meccanico
                </span>
              )}
              {user.is_verified && (
                <span style={{ fontSize: 10, background: 'var(--color-green-light)', color: 'var(--color-green)', padding: '1px 7px', borderRadius: 10, fontWeight: 500 }}>
                  ✓ Verificato
                </span>
              )}
            </div>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
              Iscritto da {joinedDate}
            </p>
            {user.bio && (
              <p style={{ fontSize: 13, color: 'var(--color-text-primary)', margin: '10px 0 0', lineHeight: 1.5 }}>
                {user.bio}
              </p>
            )}
          </div>

          {isMe && (
            <Link to="/profile/edit" style={{
              fontSize: 12, padding: '5px 12px',
              borderRadius: 'var(--border-radius-md)',
              border: '0.5px solid var(--color-border-secondary)',
              color: 'var(--color-text-secondary)',
            }}>
              Modifica
            </Link>
          )}
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: 0, marginTop: 16,
          borderTop: '0.5px solid var(--color-border-tertiary)', paddingTop: 14,
        }}>
          <Stat value={user._count.problems} label="Problemi segnalati" />
          <Stat value={user._count.solutions} label="Soluzioni pubblicate" />
          <Stat value={user.likes_received} label="Like ricevuti" />
        </div>
      </div>

      {/* Card officina (solo meccanici) */}
      {user.role === 'MECHANIC' && (user.garage_name || user.garage_address) && (
        <div style={{
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 'var(--border-radius-lg)', padding: 16,
        }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>🏪 Officina</div>
          {user.garage_name && (
            <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 4px' }}>{user.garage_name}</p>
          )}
          {user.garage_address && (
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '0 0 8px' }}>
              📍 {user.garage_address}
            </p>
          )}
          <div style={{ display: 'flex', gap: 12 }}>
            {user.maps_url && (
              <a href={user.maps_url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12, color: 'var(--color-blue)' }}>
                📌 Google Maps
              </a>
            )}
            {user.website && (
              <a href={user.website} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12, color: 'var(--color-blue)' }}>
                🌐 Sito web
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontSize: 18, fontWeight: 500 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>{label}</div>
    </div>
  )
}