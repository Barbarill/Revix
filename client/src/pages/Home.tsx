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
      return (await api.get('/cars', { params })).data
    },
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(search)
  }

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'var(--color-background-primary)',
        padding: '24px 20px 16px',
        borderBottom: '0.5px solid var(--color-border-tertiary)',
      }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>Trova il tuo modello</h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
          Problemi frequenti, soluzioni verificate dalla community
        </p>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cerca per marca (es. Fiat, Volkswagen...)"
            style={{
              flex: 1, padding: '8px 12px',
              borderRadius: 'var(--border-radius-md)',
              border: '0.5px solid var(--color-border-secondary)',
              background: 'var(--color-background-primary)',
              fontSize: 14, color: 'var(--color-text-primary)',
              outline: 'none',
            }}
          />
          <button type="submit" style={{
            padding: '8px 16px',
            borderRadius: 'var(--border-radius-md)',
            background: 'var(--color-accent)', color: '#fff',
            border: 'none', fontSize: 13, cursor: 'pointer', fontWeight: 500
          }}>
            Cerca
          </button>
        </form>
      </div>

      {/* Risultati */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '16px 20px' }}>
        {isLoading && (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>Caricamento...</p>
        )}
        {cars && cars.length === 0 && (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>Nessuna auto trovata.</p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {cars?.map(car => <CarCard key={car.id} car={car} />)}
        </div>
      </div>
    </div>
  )
}