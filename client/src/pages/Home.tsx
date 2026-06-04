import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import CarCard from '../components/CarCard'

interface Car {
  id: string
  brand: string
  model: string
  year_from: number
  year_to: number | null
  fuel: string
  horsepower: number | null
}

export default function Home() {
  const [search, setSearch] = useState('')
  const [submitted, setSubmitted] = useState('')

  const { data: cars, isLoading } = useQuery<Car[]>({
    queryKey: ['cars', submitted],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (submitted.trim()) params.brand = submitted.trim()
      const res = await api.get('/cars', { params })
      return res.data
    },
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(search)
  }

  return (
    <div style={{ maxWidth: 700, margin: '60px auto', padding: '0 16px' }}>
      <h1 style={{ fontSize: 42, fontWeight: 800, color: '#e63', marginBottom: 8 }}>Revix</h1>
      <p style={{ color: '#888', marginBottom: 40 }}>Trova i problemi comuni della tua auto</p>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cerca per marca (es. Fiat, Volkswagen...)"
          style={{
            flex: 1, padding: '12px 16px', borderRadius: 8,
            border: '1px solid #333', background: '#111', color: '#fff', fontSize: 15
          }}
        />
        <button type="submit" style={{
          padding: '12px 24px', borderRadius: 8, background: '#e63',
          color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer'
        }}>
          Cerca
        </button>
      </form>

      {isLoading && <p style={{ color: '#888' }}>Caricamento...</p>}

      {cars && cars.length === 0 && (
        <p style={{ color: '#888' }}>Nessuna auto trovata.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {cars?.map(car => <CarCard key={car.id} car={car} />)}
      </div>
    </div>
  )
}