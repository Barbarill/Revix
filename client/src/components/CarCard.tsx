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

export default function CarCard({ car }: { car: Car }) {
  const years = car.year_to ? `${car.year_from} – ${car.year_to}` : `${car.year_from} – oggi`

  return (
    <Link to={`/cars/${car.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12,
        padding: '20px 24px', cursor: 'pointer', transition: 'border-color 0.2s',
      }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = '#e63')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ margin: 0, color: '#fff', fontSize: 18 }}>{car.brand} {car.model}</h3>
            <p style={{ margin: '4px 0 0', color: '#888', fontSize: 14 }}>{years}</p>
          </div>
          <span style={{
            background: '#222', color: '#aaa', fontSize: 12,
            padding: '4px 10px', borderRadius: 20, border: '1px solid #333'
          }}>
            {car.fuel}
          </span>
        </div>
        {car.horsepower && (
          <p style={{ margin: '12px 0 0', color: '#666', fontSize: 13 }}>
            {car.horsepower} CV
          </p>
        )}
      </div>
    </Link>
  )
}