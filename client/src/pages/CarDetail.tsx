import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import ProblemForm from '../components/ProblemForm'
import ProblemList from '../components/ProblemList'

interface Car {
  id: string
  brand: string
  model: string
  year_from: number
  year_to: number | null
  fuel: string
  horsepower: number | null
  _count: { problems: number }
}

interface Problem {
  id: string
  title: string
  description: string
  category: string
  confirm_count: number
  is_official: boolean
  confirmedByMe: boolean
  created_at: string
  user: { id: string; username: string; role: string }
}

interface ProblemsResponse {
  official: Problem[]
  pending: Problem[]
}

export default function CarDetail() {
  const { id } = useParams()
  const [showForm, setShowForm] = useState(false)

  // Legge l'utente dal localStorage per sapere se è loggato
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

  if (carLoading) return <p style={{ color: '#888', margin: 40 }}>Caricamento...</p>
  if (!car) return <p style={{ color: '#888', margin: 40 }}>Auto non trovata.</p>

  const years = car.year_to ? `${car.year_from} – ${car.year_to}` : `${car.year_from} – oggi`

  return (
    <div style={{ maxWidth: 700, margin: '60px auto', padding: '0 16px' }}>
      <Link to="/" style={{ color: '#888', fontSize: 14, textDecoration: 'none' }}>
        ← Torna alla ricerca
      </Link>

      {/* Scheda auto */}
      <div style={{ margin: '24px 0', padding: '32px', background: '#1a1a1a', borderRadius: 16, border: '1px solid #2a2a2a' }}>
        <h1 style={{ margin: 0, fontSize: 32, color: '#fff' }}>{car.brand} {car.model}</h1>
        <p style={{ color: '#888', margin: '8px 0 0' }}>{years}</p>

        <div style={{ display: 'flex', gap: 16, marginTop: 24, flexWrap: 'wrap' }}>
          <Stat label="Carburante" value={car.fuel} />
          {car.horsepower && <Stat label="Potenza" value={`${car.horsepower} CV`} />}
          <Stat label="Problemi segnalati" value={String(car._count.problems)} />
        </div>
      </div>

      {/* Sezione problemi */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, color: '#fff' }}>Problemi</h2>
        {user ? (
          <button
            onClick={() => setShowForm(v => !v)}
            style={{ padding: '10px 20px', borderRadius: 8, background: showForm ? '#333' : '#e63', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
          >
            {showForm ? 'Annulla' : '+ Segnala problema'}
          </button>
        ) : (
          <Link to="/login" style={{ color: '#e63', fontSize: 14 }}>
            Accedi per segnalare
          </Link>
        )}
      </div>

      {showForm && <ProblemForm carId={car.id} onClose={() => setShowForm(false)} />}

      {problemsLoading ? (
        <p style={{ color: '#888' }}>Caricamento problemi...</p>
      ) : (
        <ProblemList
          official={problems?.official ?? []}
          pending={problems?.pending ?? []}
          carId={car.id}
        />
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#222', borderRadius: 10, padding: '12px 20px', border: '1px solid #333' }}>
      <p style={{ margin: 0, color: '#666', fontSize: 12 }}>{label}</p>
      <p style={{ margin: '4px 0 0', color: '#fff', fontWeight: 600 }}>{value}</p>
    </div>
  )
}