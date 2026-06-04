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

interface Props {
  carId: string
  onClose: () => void
}

export default function ProblemForm({ carId, onClose }: Props) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('MOTOR')

  const { mutate, isPending, isError } = useMutation({
    mutationFn: async () => {
      await api.post('/problems', { car_id: carId, title, description, category })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems', carId] })
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutate()
  }

  return (
    <div style={{
      background: '#1a1a1a', border: '1px solid #e63',
      borderRadius: 16, padding: 24, marginBottom: 24
    }}>
      <h3 style={{ margin: '0 0 20px', color: '#fff' }}>Segnala un problema</h3>

      {isError && (
        <div style={{ background: '#fee', color: '#c00', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
          Errore durante l'invio. Riprova.
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, color: '#aaa', fontSize: 13 }}>Categoria</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #333', background: '#111', color: '#fff' }}
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6, color: '#aaa', fontSize: 13 }}>Titolo</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            minLength={5}
            placeholder="Es. Rumore strano al motore a freddo"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #333', background: '#111', color: '#fff', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6, color: '#aaa', fontSize: 13 }}>Descrizione</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            minLength={10}
            rows={4}
            placeholder="Descrivi il problema nel dettaglio..."
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #333', background: '#111', color: '#fff', resize: 'vertical', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="submit"
            disabled={isPending}
            style={{ flex: 1, padding: '11px', borderRadius: 8, background: '#e63', color: '#fff', border: 'none', fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.7 : 1 }}
          >
            {isPending ? 'Invio in corso...' : 'Segnala problema'}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '11px 20px', borderRadius: 8, background: '#222', color: '#aaa', border: '1px solid #333', cursor: 'pointer' }}
          >
            Annulla
          </button>
        </div>
      </form>
    </div>
  )
}