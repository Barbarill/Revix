import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

const CATEGORIES = [
  { value: 'MOTOR', label: '🔧 Motore' },
  { value: 'ELECTRONICS', label: '⚡ Elettronica' },
  { value: 'BRAKES', label: '🛑 Freni' },
  { value: 'SUSPENSION', label: '🔩 Sospensioni' },
  { value: 'BODYWORK', label: '🚗 Carrozzeria' },
]

interface Props { carId: string; onClose: () => void }

export default function ProblemForm({ carId, onClose }: Props) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('MOTOR')

  const { mutate, isPending, isError } = useMutation({
    mutationFn: async () => api.post('/problems', { car_id: carId, title, description, category }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['problems', carId] }); onClose() },
  })

  const inputStyle = {
    width: '100%', padding: '7px 10px',
    borderRadius: 'var(--border-radius-md)',
    border: '0.5px solid var(--color-border-secondary)',
    background: 'var(--color-background-primary)',
    fontSize: 13, color: 'var(--color-text-primary)',
    outline: 'none', boxSizing: 'border-box' as const,
  }

  const labelStyle = { display: 'block', fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 5, fontWeight: 500 }

  return (
    <div style={{
      background: 'var(--color-background-primary)',
      border: '0.5px solid var(--color-border-secondary)',
      borderRadius: 'var(--border-radius-lg)', padding: 16, marginBottom: 14,
    }}>
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 14 }}>Segnala un problema</div>

      {isError && (
        <div style={{ fontSize: 12, color: '#c00', background: '#fee', padding: '8px 12px', borderRadius: 'var(--border-radius-md)', marginBottom: 12 }}>
          Errore durante l'invio. Riprova.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={labelStyle}>Categoria</label>
          <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Titolo</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required minLength={5}
            placeholder="Es. Rumore strano al motore a freddo" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Descrizione</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} required minLength={10}
            rows={3} placeholder="Descrivi il problema nel dettaglio..."
            style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => mutate()} disabled={isPending} style={{
            flex: 1, padding: '7px', borderRadius: 'var(--border-radius-md)',
            background: 'var(--color-accent)', color: '#fff', border: 'none',
            fontSize: 13, fontWeight: 500, cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.7 : 1
          }}>
            {isPending ? 'Invio...' : 'Segnala'}
          </button>
          <button onClick={onClose} style={{
            padding: '7px 16px', borderRadius: 'var(--border-radius-md)',
            background: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)',
            border: '0.5px solid var(--color-border-secondary)', fontSize: 13, cursor: 'pointer'
          }}>
            Annulla
          </button>
        </div>
      </div>
    </div>
  )
}