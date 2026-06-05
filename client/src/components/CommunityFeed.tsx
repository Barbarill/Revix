import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../services/api'

interface RecentProblem {
  id: string
  title: string
  confirm_count: number
  created_at: string
  category: string
  car: { brand: string; model: string }
  user: { username: string; role: string }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 60) return `${minutes}m fa`
  if (hours < 24) return `${hours}h fa`
  return `${days}g fa`
}

const CATEGORY_ICONS: Record<string, string> = {
  MOTOR: '🔧', ELECTRONICS: '⚡', BRAKES: '🛑', SUSPENSION: '🔩', BODYWORK: '🚗',
}

export default function CommunityFeed() {
  const { data: problems, isLoading } = useQuery<RecentProblem[]>({
    queryKey: ['problems-recent'],
    queryFn: async () => (await api.get('/problems/recent')).data,
  })

  if (isLoading) return null

  if (!problems || problems.length === 0) return null

  return (
    <div style={{
      background: 'var(--color-background-secondary)',
      borderTop: '0.5px solid var(--color-border-tertiary)',
      padding: '14px 20px',
    }}>
      <div style={{
        maxWidth: 800, margin: '0 auto',
      }}>
        <div style={{
          fontSize: 13, fontWeight: 500, marginBottom: 10,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          💬 Segnalazioni recenti dalla community
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 8,
        }}>
          {problems.slice(0, 6).map(p => (
            <Link to={`/cars/${p.car ? '' : ''}`} key={p.id} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--color-background-primary)',
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: 'var(--border-radius-md)',
                padding: '10px 12px', cursor: 'pointer',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-border-secondary)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border-tertiary)')}
              >
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>
                  {CATEGORY_ICONS[p.category]} {p.car.brand} {p.car.model}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6, lineHeight: 1.4 }}>
                  {p.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--color-green)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    ✓ {p.confirm_count} conferme
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginLeft: 'auto' }}>
                    {timeAgo(p.created_at)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}