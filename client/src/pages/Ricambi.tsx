import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'

interface Part {
  id: string
  body: string
  shop_url: string
  likes_count: number
  user: { username: string; role: string }
  problem: {
    title: string
    category: string
    car: { brand: string; model: string }
  }
}

const CATEGORIES = [
  { value: '',            label: 'Tutti' },
  { value: 'MOTOR',       label: 'Motore' },
  { value: 'ELECTRONICS', label: 'Elettronica' },
  { value: 'BRAKES',      label: 'Freni' },
  { value: 'SUSPENSION',  label: 'Sospensioni' },
  { value: 'BODYWORK',    label: 'Carrozzeria' },
]

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

export default function Ricambi() {
  const [activeCategory, setActiveCategory] = useState('')

  const { data: parts, isLoading } = useQuery<Part[]>({
    queryKey: ['parts', activeCategory],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (activeCategory) params.category = activeCategory
      return (await api.get('/solutions/parts', { params })).data
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
          <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>Ricambi consigliati</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Link ai ricambi suggeriti dalla community nelle soluzioni
          </p>
        </div>
      </div>

      {/* Filtri categoria */}
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

      {/* Lista ricambi */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '16px 20px' }}>
        {isLoading && (
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Caricamento...</p>
        )}

        {!isLoading && (!parts || parts.length === 0) && (
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Nessun ricambio trovato per questa categoria.
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {parts?.map(part => {
            const catStyle = CATEGORY_STYLE[part.problem.category] ?? { bg: '#F1EFE8', color: '#5F5E5A' }
            let hostname = ''
            try { hostname = new URL(part.shop_url).hostname } catch {}

            return (
              <div key={part.id} style={{
                background: 'var(--color-background-primary)',
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: 'var(--border-radius-lg)',
                padding: '12px 14px',
                display: 'flex', gap: 14, alignItems: 'flex-start',
              }}>
                {/* Categoria icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--border-radius-md)', flexShrink: 0,
                  background: catStyle.bg, color: catStyle.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                }}>
                  🛒
                </div>

                {/* Contenuto */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>
                      {part.problem.car.brand} {part.problem.car.model}
                    </span>
                    <span style={{
                      fontSize: 11, padding: '1px 7px', borderRadius: 20,
                      background: catStyle.bg, color: catStyle.color,
                    }}>
                      {CATEGORY_LABELS[part.problem.category]}
                    </span>
                  </div>

                  <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6, lineHeight: 1.5 }}>
                    Problema: {part.problem.title}
                  </p>

                  <p style={{ fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.5, marginBottom: 8 }}>
                    {part.body}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <a
                      href={part.shop_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 12, color: '#185FA5', textDecoration: 'none',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      🛒 Acquista su {hostname} ↗
                    </a>
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginLeft: 'auto' }}>
                      ♥ {part.likes_count} · 👤 {part.user.username}
                      {part.user.role === 'MECHANIC' && (
                        <span style={{
                          fontSize: 10, marginLeft: 4, padding: '1px 6px', borderRadius: 10,
                          background: 'var(--color-purple-light)', color: 'var(--color-purple)',
                        }}>
                          Meccanico
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}