import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import CarCard from '../components/CarCard'
import CommunityFeed from '../components/CommunityFeed'
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

const TABS = ['Tutti', 'Motore', 'Carrozzeria', 'Elettronica', 'Soluzioni']

const FUEL_OPTIONS = ['Benzina', 'Diesel', 'Ibrido', 'Elettrico']
const ANNO_OPTIONS = [
  { label: 'Prima del 2010', min: 0,    max: 2009 },
  { label: '2010–2014',      min: 2010, max: 2014 },
  { label: '2015–2019',      min: 2015, max: 2019 },
  { label: '2020 e oltre',   min: 2020, max: 9999 },
]

const BRAND_LOGO: Record<string, { svg: string; hex: string } | undefined> = {
  'Fiat':       (si as any).siFiat,
  'Volkswagen': (si as any).siVolkswagen,
  'Ford':       (si as any).siFord,
  'Toyota':     (si as any).siToyota,
  'Renault':    (si as any).siRenault,
  'Peugeot':    (si as any).siPeugeot,
  'Alfa Romeo': (si as any).siAlfaromeo,
  'BMW':        (si as any).siBmw,
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
  if (LOCAL_LOGOS[brand]) return (
    <img
      src={LOCAL_LOGOS[brand]}
      alt={brand}
      style={{ width: size, height: size, objectFit: 'contain' }}
      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
    />
  )
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

const BRANDS_ORDER = [
  'Fiat', 'Volkswagen', 'Ford', 'Toyota', 'Renault',
  'Peugeot', 'Alfa Romeo', 'BMW', 'Mercedes', 'Audi',
  'Opel', 'Lancia', 'Hyundai', 'Kia', 'Nissan',
  'Dacia', 'Jeep', 'Seat', 'Skoda',
]

const BRANDS_INITIAL = 8

interface FilterState {
  fuels: string[]
  anni: string[]
}

interface FilterSidebarProps {
  filters: FilterState
  onChange: (f: FilterState) => void
  counts: { fuels: Record<string, number>; anni: Record<string, number> }
}

function FilterSidebar({ filters, onChange, counts }: FilterSidebarProps) {
  const toggleFuel = (val: string) => {
    const fuels = filters.fuels.includes(val)
      ? filters.fuels.filter(v => v !== val)
      : [...filters.fuels, val]
    onChange({ ...filters, fuels })
  }

  const toggleAnno = (val: string) => {
    const anni = filters.anni.includes(val)
      ? filters.anni.filter(v => v !== val)
      : [...filters.anni, val]
    onChange({ ...filters, anni })
  }

  const hasFilters = filters.fuels.length > 0 || filters.anni.length > 0

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
        {title}
      </div>
      {children}
    </div>
  )

  const CheckRow = ({ label, count, checked, onChange }: { label: string; count?: number; checked: boolean; onChange: () => void }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer', fontSize: 13 }}>
      <input type="checkbox" checked={checked} onChange={onChange}
        style={{ accentColor: '#D85A30', width: 14, height: 14, cursor: 'pointer' }} />
      <span style={{ flex: 1, color: 'var(--color-text-primary)' }}>{label}</span>
      {count !== undefined && (
        <span style={{ fontSize: 11, background: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)', padding: '1px 6px', borderRadius: 20 }}>
          {count}
        </span>
      )}
    </label>
  )

  return (
    <div style={{
      background: 'var(--color-background-primary)',
      border: '0.5px solid var(--color-border-tertiary)',
      borderRadius: 'var(--border-radius-lg)',
      padding: '14px 16px', alignSelf: 'start',
      position: 'sticky', top: 60,
    }}>
      {hasFilters && (
        <button
          onClick={() => onChange({ fuels: [], anni: [] })}
          style={{
            fontSize: 11, color: 'var(--color-accent)', background: 'none',
            border: 'none', cursor: 'pointer', padding: 0, marginBottom: 14,
          }}
        >
          ✕ Azzera filtri
        </button>
      )}

      <Section title="Carburante">
        {FUEL_OPTIONS.map(f => (
          <CheckRow
            key={f} label={f}
            count={counts.fuels[f] ?? 0}
            checked={filters.fuels.includes(f)}
            onChange={() => toggleFuel(f)}
          />
        ))}
      </Section>

      <Section title="Anno veicolo">
        {ANNO_OPTIONS.map(a => (
          <CheckRow
            key={a.label} label={a.label}
            count={counts.anni[a.label] ?? 0}
            checked={filters.anni.includes(a.label)}
            onChange={() => toggleAnno(a.label)}
          />
        ))}
      </Section>
    </div>
  )
}

export default function Home() {
  const [brand,         setBrand]         = useState('')
  const [model,         setModel]         = useState('')
  const [year,          setYear]          = useState('')
  const [activeTab,     setActiveTab]     = useState('Tutti')
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [showAllBrands, setShowAllBrands] = useState(false)
  const [params,        setParams]        = useState<Record<string, string>>({})
  const [filters,       setFilters]       = useState<FilterState>({ fuels: [], anni: [] })

  const years = Array.from({ length: 25 }, (_, i) => String(2024 - i))

  const { data: allCars, isLoading } = useQuery<Car[]>({
    queryKey: ['cars', params],
    queryFn: async () => (await api.get('/cars', { params })).data,
  })

  const brandsInDb = BRANDS_ORDER.filter(b => allCars?.some(c => c.brand === b))
  const visibleBrands = showAllBrands ? brandsInDb : brandsInDb.slice(0, BRANDS_INITIAL)

  // Base cars per conteggi (senza filtri sidebar)
  const baseCars = selectedBrand
    ? allCars?.filter(c => c.brand === selectedBrand) ?? []
    : allCars ?? []

  // Cars filtrate per marca + filtri sidebar
  const filteredCars = baseCars.filter(car => {
    if (filters.fuels.length > 0 && !filters.fuels.includes(car.fuel)) return false
    if (filters.anni.length > 0) {
      const match = ANNO_OPTIONS
        .filter(a => filters.anni.includes(a.label))
        .some(a => car.year_from <= a.max && (car.year_to ?? 9999) >= a.min)
      if (!match) return false
    }
    return true
  })

  // Conteggi badge sidebar
  const fuelCounts = FUEL_OPTIONS.reduce<Record<string, number>>((acc, f) => {
    acc[f] = baseCars.filter(c => c.fuel === f).length
    return acc
  }, {})

  const annoCounts = ANNO_OPTIONS.reduce<Record<string, number>>((acc, a) => {
    acc[a.label] = baseCars.filter(c =>
      c.year_from <= a.max && (c.year_to ?? 9999) >= a.min
    ).length
    return acc
  }, {})

  // Raggruppamento per modello quando marca selezionata
  const groupedByModel = selectedBrand
    ? filteredCars.reduce<Record<string, Car[]>>((acc, car) => {
        if (!acc[car.model]) acc[car.model] = []
        acc[car.model].push(car)
        return acc
      }, {})
    : null

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const p: Record<string, string> = {}
    if (brand.trim()) p.brand = brand.trim()
    if (model.trim()) p.model = model.trim()
    if (year)         p.year  = year
    setParams(p)
    setSelectedBrand(null)
    setFilters({ fuels: [], anni: [] })
  }

  const handleBrandClick = (b: string) => {
    setSelectedBrand(prev => prev === b ? null : b)
    setFilters({ fuels: [], anni: [] })
  }

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'var(--color-background-secondary)',
        padding: '24px 20px 16px',
        borderBottom: '0.5px solid var(--color-border-tertiary)',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>Trova il tuo modello</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
            Problemi frequenti, soluzioni verificate dalla community
          </p>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select value={brand} onChange={e => setBrand(e.target.value)} style={{
              padding: '8px 12px', borderRadius: 'var(--border-radius-md)',
              border: '0.5px solid var(--color-border-secondary)',
              background: 'var(--color-background-primary)',
              fontSize: 13, cursor: 'pointer', minWidth: 130,
              color: brand ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            }}>
              <option value="">Marca</option>
              {BRANDS_ORDER.map(b => <option key={b} value={b}>{b}</option>)}
            </select>

            <input type="text" value={model} onChange={e => setModel(e.target.value)}
              placeholder="Modello" style={{
                padding: '8px 12px', borderRadius: 'var(--border-radius-md)',
                border: '0.5px solid var(--color-border-secondary)',
                background: 'var(--color-background-primary)',
                fontSize: 13, outline: 'none', minWidth: 110,
                color: 'var(--color-text-primary)',
              }} />

            <select value={year} onChange={e => setYear(e.target.value)} style={{
              padding: '8px 12px', borderRadius: 'var(--border-radius-md)',
              border: '0.5px solid var(--color-border-secondary)',
              background: 'var(--color-background-primary)',
              fontSize: 13, cursor: 'pointer', minWidth: 100,
              color: year ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            }}>
              <option value="">Anno</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>

            <button type="submit" style={{
              padding: '8px 16px', borderRadius: 'var(--border-radius-md)',
              background: 'var(--color-accent)', color: '#fff',
              border: 'none', fontSize: 13, cursor: 'pointer', fontWeight: 500,
            }}>
              Cerca
            </button>
          </form>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{
        borderBottom: '0.5px solid var(--color-border-tertiary)',
        background: 'var(--color-background-primary)', padding: '0 20px',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              fontSize: 13, padding: '10px 14px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontWeight: activeTab === tab ? 500 : 400,
              color: activeTab === tab ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === tab ? '2px solid var(--color-accent)' : '2px solid transparent',
            }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Layout 2 colonne */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>

          {/* Sidebar con filtri reali */}
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            counts={{ fuels: fuelCounts, anni: annoCounts }}
          />

          {/* Colonna destra */}
          <div>
            {isLoading && <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Caricamento...</p>}

            {/* Griglia marche — solo se nessun filtro attivo e nessuna ricerca */}
            {!isLoading && !selectedBrand && Object.keys(params).length === 0 && filters.fuels.length === 0 && filters.anni.length === 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Sfoglia per marca
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {visibleBrands.map(b => (
                    <button
                      key={b}
                      onClick={() => handleBrandClick(b)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                        padding: '10px 8px',
                        background: selectedBrand === b ? 'var(--color-background-secondary)' : 'var(--color-background-primary)',
                        border: `0.5px solid ${selectedBrand === b ? 'var(--color-accent)' : 'var(--color-border-tertiary)'}`,
                        borderRadius: 'var(--border-radius-lg)',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-border-secondary)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = selectedBrand === b ? 'var(--color-accent)' : 'var(--color-border-tertiary)')}
                    >
                      <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BrandLogo brand={b} size={30} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--color-text-primary)', fontWeight: 500 }}>{b}</span>
                    </button>
                  ))}
                </div>

                {brandsInDb.length > BRANDS_INITIAL && (
                  <button
                    onClick={() => setShowAllBrands(v => !v)}
                    style={{
                      marginTop: 10, fontSize: 12,
                      color: 'var(--color-accent)', background: 'none',
                      border: 'none', cursor: 'pointer', padding: 0,
                    }}
                  >
                    {showAllBrands ? '↑ Mostra meno' : `↓ Mostra tutte le marche (${brandsInDb.length})`}
                  </button>
                )}
              </div>
            )}

            {/* Lista filtrata per sidebar — filtri attivi senza marca selezionata */}
            {!isLoading && !selectedBrand && Object.keys(params).length === 0 && (filters.fuels.length > 0 || filters.anni.length > 0) && (
              <div>
                {filteredCars.length === 0
                  ? <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Nessuna auto trovata con questi filtri.</p>
                  : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {filteredCars.map(car => <CarCard key={car.id} car={car} />)}
                    </div>
                }
              </div>
            )}

            {/* Lista modelli — marca selezionata o ricerca attiva */}
            {(selectedBrand || Object.keys(params).length > 0) && (
              <div>
                {selectedBrand && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <BrandLogo brand={selectedBrand} size={22} />
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{selectedBrand}</span>
                    <button onClick={() => setSelectedBrand(null)} style={{
                      marginLeft: 'auto', fontSize: 12,
                      color: 'var(--color-text-secondary)', background: 'none',
                      border: 'none', cursor: 'pointer',
                    }}>
                      ← Tutte le marche
                    </button>
                  </div>
                )}

                {filteredCars.length === 0 && (
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Nessuna auto trovata.</p>
                )}

                {groupedByModel
                  ? Object.entries(groupedByModel).map(([modelName, versions]) => (
                      <div key={modelName} style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {modelName}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {versions.map(car => <CarCard key={car.id} car={car} />)}
                        </div>
                      </div>
                    ))
                  : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {filteredCars.map(car => <CarCard key={car.id} car={car} />)}
                    </div>
                }
              </div>
            )}
          </div>
        </div>
      </div>

      <CommunityFeed />
    </div>
  )
}