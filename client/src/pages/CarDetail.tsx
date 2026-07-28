import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import ProblemForm from '../components/ProblemForm'
import ProblemList from '../components/ProblemList'

interface Car {
  id: string; brand: string; model: string
  year_from: number; year_to: number | null
  fuel: string; horsepower: number | null
  _count: { problems: number; solutions: number; users: number }  // ← aggiornato
}

interface Problem {
  id: string; title: string; description: string
  category: string; confirm_count: number
  is_official: boolean; confirmedByMe: boolean
  created_at: string
  user: { id: string; username: string; role: string }
}

interface ProblemsResponse { official: Problem[]; pending: Problem[] }

// ← fix 2.6: helper tag diffusione
function diffusionTag(problemCount: number): { label: string } {
  if (problemCount > 20) return { label: 'Molto diffusa' }
  if (problemCount > 5)  return { label: 'Comune' }
  return                        { label: 'Rara' }
}

export default function CarDetail() {
  const { id } = useParams()
  const [showForm, setShowForm] = useState(false)
  const storedUser = localStorage.getItem('user')
  const user = storedUser ? JSON.parse(storedUser) : null

  const { data: car, isLoading: carLoading } = useQuery<Car>({
    queryKey: ['car', id],
    queryFn: async () => (await api.get(`/cars/${id}`)).data,
  })

  const { data: problems, isLoading: problemsLoading } = useQuery<ProblemsResponse>({
    queryKey: ['problems', id, user?.id],
    queryFn: async () => {
      const params = user ? { userId: user.id } : {}
      return (await api.get(`/cars/${id}/problems`, { params })).data
    },
  })

  if (carLoading) return <p style={{ padding: 20, color: 'var(--color-text-secondary)', fontSize: 13 }}>Caricamento...</p>
  if (!car) return <p style={{ padding: 20, color: 'var(--color-text-secondary)', fontSize: 13 }}>Auto non trovata.</p>

  const years = car.year_to ? `${car.year_from} – ${car.year_to}` : `${car.year_from} – oggi`
  const tag = diffusionTag(car._count.problems)                   // ← fix 2.6

  return (
    <div>
      {/* Header auto */}
      <div style={{
        background: 'var(--color-background-primary)',
        borderBottom: '0.5px solid var(--color-border-tertiary)',
        padding: '16px 20px',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Link to="/" style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>← Catalogo</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12 }}>
            <div style={{
              width: 56, height: 40, borderRadius: 'var(--border-radius-md)',
              background: 'var(--color-background-secondary)',
              border: '0.5px solid var(--color-border-tertiary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
            }}>🚗</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 17, fontWeight: 500, marginBottom: 2 }}>{car.brand} {car.model}</h2>
              <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                {years} · {car.fuel}{car.horsepower ? ` · ${car.horsepower} CV` : ''}
              </p>
              {/* ← fix 2.6: tag diffusione */}
              <span style={{
                display: 'inline-block', marginTop: 4,
                fontSize: 11, padding: '2px 8px', borderRadius: 20,
                background: '#F1EFE8', color: '#5F5E5A',
              }}>
                {tag.label}
              </span>
            </div>
            {/* ← fix 2.5: stat Soluzioni e Utenti aggiunte */}
            <div style={{ display: 'flex', gap: 24 }}>
              <Stat label="Problemi"  value={String(car._count.problems)}  />
              <Stat label="Soluzioni" value={String(car._count.solutions)} />
              <Stat label="Utenti"    value={String(car._count.users)}     />
            </div>
          </div>
        </div>
      </div>

      {/* Contenuto */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Problemi segnalati</span>
          {user ? (
            <button onClick={() => setShowForm(v => !v)} style={{
              fontSize: 12, padding: '5px 14px',
              borderRadius: 'var(--border-radius-md)',
              background: showForm ? 'var(--color-background-secondary)' : 'var(--color-accent)',
              color: showForm ? 'var(--color-text-primary)' : '#fff',
              border: '0.5px solid ' + (showForm ? 'var(--color-border-secondary)' : 'var(--color-accent)'),
              cursor: 'pointer', fontWeight: 500
            }}>
              {showForm ? 'Annulla' : '+ Segnala problema'}
            </button>
          ) : (
            <Link to="/login" style={{ fontSize: 12, color: 'var(--color-accent)' }}>Accedi per segnalare</Link>
          )}
        </div>

        {showForm && <ProblemForm carId={car.id} onClose={() => setShowForm(false)} />}

        {problemsLoading
          ? <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Caricamento...</p>
          : <ProblemList official={problems?.official ?? []} pending={problems?.pending ?? []} carId={car.id} />
        }
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 18, fontWeight: 500 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{label}</div>
    </div>
  )
}