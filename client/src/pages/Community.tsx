import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'

interface Problem {
  id: string
  title: string
  description: string
  category: string
  confirm_count: number
  is_official: boolean
  created_at: string
  car_id: string
  car: { brand: string; model: string }
  user: { username: string; role: string }
}

const CATEGORIES = [
  { value: '',            label: 'Tutti' },
  { value: 'MOTOR',       label: 'Motore' },
  { value: 'ELECTRONICS', label: 'Elettronica' },
  { value: 'BRAKES',      label: 'Freni' },
  { value: 'SUSPENSION',  label: 'Sospensioni' },
  { value: 'BODYWORK',    label: 'Carrozzeria' },
]

const CATEGORY_ICONS: Record<string, string> = {
  MOTOR: '🔧', ELECTRONICS: '⚡', BRAKES: '🛑', SUSPENSION: '🔩', BODYWORK: '🚗',
}

const CATEGORY_STYLE: Record<string, { bg: string; color: string }> = {
  MOTOR:       { bg: '#FAECE7', color: '#993C1D' },
  ELECTRONICS: { bg: '#E6F1FB', color: '#185FA5' },
  BRAKES:      { bg: '#FEF3E2', color: '#A05C00' },
  SUSPENSION:  { bg: '#F1EFE8', color: '#5F5E5A' },
  BODYWORK:    { bg: '#E6F1FB', color: '#185FA5' },
}

const CATEGORY_LABELS: Record<string, string> = {
  MOTOR: 'Motore', ELECTRONICS: 'Elettronica', BRAKES: 'Freni',
  SUSPENSION: 'Sospensioni', BODYWORK: 'Carrozzeria',
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

export default function Community() {
  const [activeCategory, setActiveCategory] = useState('')
  const [sort, setSort] = useState<'recent' | 'confirms'>('recent')
  const [onlyOfficial, setOnlyOfficial] = useState(false)

  const { data: problems, isLoading } = useQuery<Problem[]>({
    queryKey: ['community', activeCategory, sort, onlyOfficial],
    queryFn: async () => {
      const params: Record<string, string> = { sort }
      if (activeCategory) params.category = activeCategory
      if (onlyOfficial)   params.official = 'true'
      return (await api.get('/problems/recent', { params })).data
    },
  })

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'var(--color-background-secondary)',
        borderBottom: '0.5px solid var(--color-border-tertiary)',
        padding: '24px 20px 16px',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>Community</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Tutte le segnalazioni recenti dalla community Revix
          </p>
        </div>
      </div>

      {/* Tab categorie */}
      <div style={{
        borderBottom: '0.5px solid var(--color-border-tertiary)',
        background: 'var(--color-background-primary)',
        padding: '0 20px',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', gap: 0 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              style={{
                fontSize: 13, padding: '10px 14px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontWeight: activeCategory === cat.value ? 500 : 400,
                color: activeCategory === cat.value ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                borderBottom: activeCategory === cat.value ? '2px solid var(--color-accent)' : '2px solid transparent',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenuto */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '16px 20px' }}>

        {/* Toolbar sort + filtro */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            {problems?.length ?? 0} segnalazioni
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Toggle solo ufficiali */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
              <input
                type="checkbox"
                checked={onlyOfficial}
                onChange={e => setOnlyOfficial(e.target.checked)}
                style={{ accentColor: '#D85A30' }}
              />
              Solo confermati
            </label>

            {/* Sort */}
            <select
              value={sort}
              onChange={e => setSort(e.target.value as 'recent' | 'confirms')}
              style={{
                fontSize: 12, padding: '4px 8px',
                borderRadius: 'var(--border-radius-md)',
                border: '0.5px solid var(--color-border-secondary)',
                background: 'var(--color-background-primary)',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
              }}
            >
              <option value="recent">Più recenti</option>
              <option value="confirms">Più confermati</option>
            </select>
          </div>
        </div>

        {isLoading && (
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Caricamento...</p>
        )}

        {!isLoading && (!problems || problems.length === 0) && (
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Nessuna segnalazione trovata.
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {problems?.map(p => {
            const catStyle = CATEGORY_STYLE[p.category] ?? { bg: '#F1EFE8', color: '#5F5E5A' }
            return (
              <Link
                key={p.id}
                to={`/cars/${p.car_id}#problem-${p.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  background: 'var(--color-background-primary)',
                  border: '0.5px solid var(--color-border-tertiary)',
                  borderRadius: 'var(--border-radius-lg)',
                  padding: '12px 14px',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-border-secondary)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border-tertiary)')}
                >
                  {/* Top */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 'var(--border-radius-md)', flexShrink: 0,
                      background: catStyle.bg, color: catStyle.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
                    }}>
                      {CATEGORY_ICONS[p.category]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2, color: 'var(--color-text-primary)' }}>
                        {p.title}
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                          {p.car.brand} {p.car.model}
                        </span>
                        <span style={{
                          fontSize: 11, padding: '1px 7px', borderRadius: 20,
                          background: catStyle.bg, color: catStyle.color,
                        }}>
                          {CATEGORY_LABELS[p.category]}
                        </span>
                        {p.is_official && (
                          <span style={{
                            fontSize: 11, padding: '1px 7px', borderRadius: 20,
                            background: '#E1F5EE', color: '#0F6E56',
                          }}>
                            ✓ Confermato
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Descrizione */}
                  <p style={{
                    fontSize: 13, color: 'var(--color-text-secondary)',
                    lineHeight: 1.5, marginBottom: 8,
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {p.description}
                  </p>

                  {/* Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--color-green)' }}>
                      👥 {p.confirm_count} conferme
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginLeft: 'auto' }}>
                      👤 {p.user.username} · {timeAgo(p.created_at)}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}