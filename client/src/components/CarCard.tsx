import { Link } from 'react-router-dom'

interface Car {
  id: string
  brand: string
  model: string
  year_from: number
  year_to: number | null
  fuel: string
  horsepower: number | null
}

const FUEL_COLORS: Record<string, { bg: string; color: string }> = {
  'Benzina': { bg: '#FAECE7', color: '#993C1D' },
  'Diesel':  { bg: '#E6F1FB', color: '#185FA5' },
  'Ibrido':  { bg: '#E1F5EE', color: '#0F6E56' },
  'Elettrico': { bg: '#EEEDFE', color: '#534AB7' },
}

export default function CarCard({ car }: { car: Car }) {
  const years = car.year_to ? `${car.year_from} – ${car.year_to}` : `${car.year_from} – oggi`
  const fuelStyle = FUEL_COLORS[car.fuel] ?? { bg: '#F1EFE8', color: '#5F5E5A' }

  return (
    <Link to={`/cars/${car.id}`}>
      <div style={{
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: 'var(--border-radius-lg)',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 14,
        cursor: 'pointer', transition: 'border-color 0.15s',
      }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-border-secondary)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border-tertiary)')}
      >
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--border-radius-md)',
          background: 'var(--color-background-secondary)',
          border: '0.5px solid var(--color-border-tertiary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, flexShrink: 0,
        }}>🚗</div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{car.brand} {car.model}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
            {years} {car.horsepower ? `· ${car.horsepower} CV` : ''}
          </div>
        </div>

        <span style={{
          fontSize: 11, padding: '2px 8px', borderRadius: 20,
          background: fuelStyle.bg, color: fuelStyle.color, fontWeight: 500
        }}>
          {car.fuel}
        </span>
      </div>
    </Link>
  )
}