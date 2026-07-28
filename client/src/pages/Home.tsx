import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'
import api from '../services/api'
import CarCard from '../components/CarCard'
import CommunityFeed from '../components/CommunityFeed'

interface Car {
  id: string
  brand: string
  model: string
  year_from: number
  year_to: number | null
  fuel: string
  horsepower: number | null
  _count?: { problems: number }
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────
const TABS = ['Tutti', 'Motore', 'Carrozzeria', 'Elettronica', 'Soluzioni']

// ─── FilterSidebar ────────────────────────────────────────────────────────────
const FILTER_TIPOLOGIA = [
  { label: 'Motore',      count: 34 },
  { label: 'Carrozzeria', count: 21 },
  { label: 'Elettronica', count: 15 },
  { label: 'Freni',       count: 9  },
]
const FILTER_FREQUENZA  = ['Molto comune', 'Comune', 'Raro']
const FILTER_ANNO       = ['2015–2018', '2019–2022', '2023+']

function FilterSidebar() {
  const [tipologia, setTipologia] = useState<string[]>([])
  const [frequenza, setFrequenza] = useState<string[]>([])
  const [anno,      setAnno]      = useState<string[]>([])

  const toggle = (list: string[], setList: (v: string[]) => void, val: string) =>
    setList(list.includes(val) ? list.filter(v => v !== val) : [...list, val])

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
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ accentColor: '#D85A30', width: 14, height: 14, cursor: 'pointer' }}
      />
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
      padding: '14px 16px',
      alignSelf: 'start',
      position: 'sticky', top: 60,
    }}>
      <Section title="Tipologia">
        {FILTER_TIPOLOGIA.map(f => (
          <CheckRow key={f.label} label={f.label} count={f.count}
            checked={tipologia.includes(f.label)}
            onChange={() => toggle(tipologia, setTipologia, f.label)}
          />
        ))}
      </Section>
      <Section title="Frequenza">
        {FILTER_FREQUENZA.map(f => (
          <CheckRow key={f} label={f}
            checked={frequenza.includes(f)}
            onChange={() => toggle(frequenza, setFrequenza, f)}
          />
        ))}
      </Section>
      <Section title="Anno veicolo">
        {FILTER_ANNO.map(f => (
          <CheckRow key={f} label={f}
            checked={anno.includes(f)}
            onChange={() => toggle(anno, setAnno, f)}
          />
        ))}
      </Section>
    </div>
  )
}

// ─── Home ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [brand,     setBrand]     = useState('')
  const [model,     setModel]     = useState('')
  const [year,      setYear]      = useState('')
  const [problem,   setProblem]   = useState('')
  const [activeTab, setActiveTab] = useState('Tutti')

  // Params della query — si aggiornano solo al submit
  const [params, setParams] = useState<Record<string, string>>({})

  const { data: cars, isLoading } = useQuery<Car[]>({
    queryKey: ['cars', params],
    queryFn: async () => (await api.get('/cars', { params })).data,
  })

  // Select modelli unici dalla risposta (per ora statico, si può rendere dinamico)
  const brands  = ['Fiat', 'Volkswagen', 'Ford', 'BMW', 'Toyota', 'Renault', 'Audi', 'Opel', 'Mercedes', 'Peugeot']
  const years   = Array.from({ length: 25 }, (_, i) => String(2024 - i))   // 2024 → 2000

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const p: Record<string, string> = {}
    if (brand.trim())   p.brand = brand.trim()
    if (model.trim())   p.model = model.trim()
    if (year)           p.year  = year
    setParams(p)
  }

  return (
    <div>
      {/* Hero — fix 2.1 */}
      <div style={{
        background: 'var(--color-background-secondary)',        // ← era primary
        padding: '24px 20px 16px',
        borderBottom: '0.5px solid var(--color-border-tertiary)',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>Trova il tuo modello</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
            Problemi frequenti, soluzioni verificate dalla community
          </p>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {/* Select Marca */}
            <select
              value={brand}
              onChange={e => setBrand(e.target.value)}
              style={{
                padding: '8px 12px', borderRadius: 'var(--border-radius-md)',
                border: '0.5px solid var(--color-border-secondary)',
                background: 'var(--color-background-primary)',
                fontSize: 13, color: brand ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                cursor: 'pointer', minWidth: 130,
              }}
            >
              <option value="">Marca</option>
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>

            {/* Input Modello */}
            <input
              type="text"
              value={model}
              onChange={e => setModel(e.target.value)}
              placeholder="Modello"
              style={{
                padding: '8px 12px', borderRadius: 'var(--border-radius-md)',
                border: '0.5px solid var(--color-border-secondary)',
                background: 'var(--color-background-primary)',
                fontSize: 13, color: 'var(--color-text-primary)',
                outline: 'none', minWidth: 110,
              }}
            />

            {/* Select Anno */}
            <select
              value={year}
              onChange={e => setYear(e.target.value)}
              style={{
                padding: '8px 12px', borderRadius: 'var(--border-radius-md)',
                border: '0.5px solid var(--color-border-secondary)',
                background: 'var(--color-background-primary)',
                fontSize: 13, color: year ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                cursor: 'pointer', minWidth: 100,
              }}
            >
              <option value="">Anno</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>

            {/* Input problema */}
            <input
              type="text"
              value={problem}
              onChange={e => setProblem(e.target.value)}
              placeholder="Descrivi il problema..."
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 'var(--border-radius-md)',
                border: '0.5px solid var(--color-border-secondary)',
                background: 'var(--color-background-primary)',
                fontSize: 13, color: 'var(--color-text-primary)',
                outline: 'none', minWidth: 160,
              }}
            />

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

      {/* Tab bar — fix 2.2 */}
      <div style={{
        borderBottom: '0.5px solid var(--color-border-tertiary)',
        background: 'var(--color-background-primary)',
        padding: '0 20px',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', gap: 0 }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                fontSize: 13, padding: '10px 14px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontWeight: activeTab === tab ? 500 : 400,
                color: activeTab === tab ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                borderBottom: activeTab === tab ? '2px solid var(--color-accent)' : '2px solid transparent',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Layout 2 colonne — fix 2.3 */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>

          {/* Colonna sinistra — FilterSidebar fix 2.4 */}
          <FilterSidebar />

          {/* Colonna destra — lista auto */}
          <div>
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
      </div>

      {/* Feed community */}
      <CommunityFeed />
    </div>
  )
}