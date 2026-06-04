import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'

interface Car {
  id: string
  brand: string
  model: string
  year_from: number
  year_to: number | null
  fuel: string
  horsepower: number | null
  created_at: string
  _count: { problems: number }
}

export default function CarDetail() {
  const { id } = useParams()

  const { data: car, isLoading } = useQuery<Car>({
    queryKey: ['car', id],
    queryFn: async () => {
      const res = await api.get(`/cars/${id}`)
      return res.data
    },
  })

  if (isLoading) return <p style={{ color: '#888', margin: 40 }}>Caricamento...</p>
  if (!car) return <p style={{ color: '#888', margin: 40 }}>Auto non trovata.</p>

  const years = car.year_to ? `${car.year_from} – ${car.year_to}` : `${car.year_from} – oggi`

  return (
    <div style={{ maxWidth: 700, margin: '60px auto', padding: '0 16px' }}>
      <Link to="/" style={{ color: '#888', fontSize: 14, textDecoration: 'none' }}>
        ← Torna alla ricerca
      </Link>

      <div style={{ margin: '24px 0', padding: '32px', background: '#1a1a1a', borderRadius: 16, border: '1px solid #2a2a2a' }}>
        <h1 style={{ margin: 0, fontSize: 32, color: '#fff' }}>{car.brand} {car.model}</h1>
        <p style={{ color: '#888', margin: '8px 0 0' }}>{years}</p>

        <div style={{ display: 'flex', gap: 16, marginTop: 24, flexWrap: 'wrap' }}>
          <Stat label="Carburante" value={car.fuel} />
          {car.horsepower && <Stat label="Potenza" value={`${car.horsepower} CV`} />}
          <Stat label="Problemi segnalati" value={String(car._count.problems)} />
        </div>
      </div>

      <div style={{ padding: '24px', background: '#1a1a1a', borderRadius: 16, border: '1px solid #2a2a2a' }}>
        <p style={{ color: '#666', margin: 0, textAlign: 'center' }}>
          I problemi arriveranno nel Passo 2.1 🔧
        </p>
      </div>
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