import { Link } from 'react-router-dom'
import * as si from 'simple-icons'

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
  'Benzina':   { bg: '#FAECE7', color: '#993C1D' },
  'Diesel':    { bg: '#E6F1FB', color: '#185FA5' },
  'Ibrido':    { bg: '#E1F5EE', color: '#0F6E56' },
  'Elettrico': { bg: '#EEEDFE', color: '#534AB7' },
}

const BRAND_LOGO: Record<string, { svg: string; hex: string } | undefined> = {
  'Fiat':       (si as any).siFiat,
  'Volkswagen': (si as any).siVolkswagen,
  'Ford':       (si as any).siFord,
  'Toyota':     (si as any).siToyota,
  'Renault':    (si as any).siRenault,
  'Peugeot':    (si as any).siPeugeot,
  'Alfa Romeo': (si as any).siAlfaromeo,
  'BMW':        (si as any).siBmw,
  'Mercedes':   (si as any).siMercedesbenz ?? (si as any).siMercedes ?? undefined,
  'Audi':       (si as any).siAudi,
  'Opel':       (si as any).siOpel,
  'Hyundai':    (si as any).siHyundai,
  'Kia':        (si as any).siKia,
  'Nissan':     (si as any).siNissan,
  'Dacia':      (si as any).siDacia,
  'Jeep':       (si as any).siJeep,
  'Seat':       (si as any).siSeat,
  'Skoda':      (si as any).siSkoda,
}
const LOCAL_LOGOS: Record<string, string> = {
  'Lancia':     '/logos/logo_lancia.svg',
  'Alfa Romeo': '/logos/Alfa.svg',
  'Mercedes':   '/logos/Mercedes.svg',
}

function BrandLogo({ brand, size = 28 }: { brand: string; size?: number }) {
  // 1. File locale se disponibile
  if (LOCAL_LOGOS[brand]) return (
    <img
      src={LOCAL_LOGOS[brand]}
      alt={brand}
      style={{ width: size, height: size, objectFit: 'contain' }}
      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
    />
  )

  // 2. simple-icons
  const logo = BRAND_LOGO[brand]
  if (!logo) return <span style={{ fontSize: 18 }}>🚗</span>
  return (
    <div
      style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      dangerouslySetInnerHTML={{
        __html: logo.svg.replace('<svg', `<svg width="${size}" height="${size}" fill="#${logo.hex}"`),
      }}
    />
  )
}

export default function CarCard({ car }: { car: Car }) {
  const years = car.year_to ? `${car.year_from} – ${car.year_to}` : `${car.year_from} – oggi`
  const fuelStyle = FUEL_COLORS[car.fuel] ?? { bg: '#F1EFE8', color: '#5F5E5A' }

  return (
    <Link to={`/cars/${car.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: 'var(--border-radius-lg)',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 14,
        cursor: 'pointer',
      }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-border-secondary)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border-tertiary)')}
      >
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--border-radius-md)',
          background: 'var(--color-background-secondary)',
          border: '0.5px solid var(--color-border-tertiary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <BrandLogo brand={car.brand} size={26} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
            {car.brand} {car.model}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
            {years}{car.horsepower ? ` · ${car.horsepower} CV` : ''}
          </div>
        </div>

        <span style={{
          fontSize: 11, padding: '2px 8px', borderRadius: 20,
          background: fuelStyle.bg, color: fuelStyle.color, fontWeight: 500, flexShrink: 0,
        }}>
          {car.fuel}
        </span>
      </div>
    </Link>
  )
}