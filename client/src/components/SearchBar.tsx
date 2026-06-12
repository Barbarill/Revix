import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

interface Car {
  id: string
  brand: string
  model: string
  year_from: number
  year_to: number | null
  fuel: string
}

interface Problem {
  id: string
  title: string
  category: string
  confirm_count: number
  is_official: boolean
  car: { brand: string; model: string }
}

interface SearchResults {
  cars: Car[]
  problems: Problem[]
}

const CATEGORY_ICONS: Record<string, string> = {
  MOTOR: '🔧',
  ELECTRONICS: '⚡',
  BRAKES: '🛑',
  SUSPENSION: '🔩',
  BODYWORK: '🚗',
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Chiude il dropdown cliccando fuori
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Debounce ricerca
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 2) {
      setResults(null)
      setOpen(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await api.get<SearchResults>(`/search?q=${encodeURIComponent(query)}`)
        setResults(res.data)
        setOpen(true)
      } catch {
        // silenzioso
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [query])

  const hasResults = results && (results.cars.length > 0 || results.problems.length > 0)

  const goToCar = (id: string) => {
    setOpen(false)
    setQuery('')
    navigate(`/cars/${id}`)
  }

  const goToProblem = (carId: string, problemId: string) => {
    setOpen(false)
    setQuery('')
    navigate(`/cars/${carId}#problem-${problemId}`)
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%', maxWidth: 520 }}>
      {/* Input */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-secondary)',
        borderRadius: 8,
        padding: '8px 12px',
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Cerca auto o problema..."
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: 13,
            color: 'var(--color-text-primary)',
            width: '100%',
          }}
        />
        {loading && (
          <div style={{
            width: 14, height: 14, border: '2px solid var(--color-border-tertiary)',
            borderTopColor: 'var(--color-accent)', borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }} />
        )}
      </div>

      {/* Dropdown risultati */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0, right: 0,
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          zIndex: 100,
          overflow: 'hidden',
        }}>
          {!hasResults ? (
            <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
              Nessun risultato per "{query}"
            </div>
          ) : (
            <>
              {/* Auto */}
              {results!.cars.length > 0 && (
                <div>
                  <div style={{
                    padding: '8px 16px 4px',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--color-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '0.5px solid var(--color-border-tertiary)',
                  }}>Auto</div>
                  {results!.cars.map(car => (
                    <button
                      key={car.id}
                      onClick={() => goToCar(car.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        width: '100%', padding: '9px 16px',
                        background: 'transparent', border: 'none',
                        cursor: 'pointer', textAlign: 'left',
                        borderBottom: '0.5px solid var(--color-border-tertiary)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-background-secondary)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span style={{ fontSize: 14 }}>🚗</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                          {car.brand} {car.model}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                          {car.year_from}–{car.year_to ?? 'oggi'} · {car.fuel}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Problemi */}
              {results!.problems.length > 0 && (
                <div>
                  <div style={{
                    padding: '8px 16px 4px',
                    fontSize: 11, fontWeight: 600,
                    color: 'var(--color-text-secondary)',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    borderBottom: '0.5px solid var(--color-border-tertiary)',
                  }}>Problemi</div>
                  {results!.problems.map(problem => (
                    <button
                      key={problem.id}
                      onClick={() => goToProblem(problem.car as any, problem.id)}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                        width: '100%', padding: '9px 16px',
                        background: 'transparent', border: 'none',
                        cursor: 'pointer', textAlign: 'left',
                        borderBottom: '0.5px solid var(--color-border-tertiary)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-background-secondary)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span style={{ fontSize: 14, marginTop: 1 }}>
                        {CATEGORY_ICONS[problem.category] ?? '🔧'}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 13, fontWeight: 500,
                          color: 'var(--color-text-primary)',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {problem.title}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                          {(problem.car as any).brand} {(problem.car as any).model} · {problem.confirm_count} conferme
                          {problem.is_official && (
                            <span style={{ marginLeft: 6, color: 'var(--color-green)', fontWeight: 600 }}>✓ ufficiale</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}