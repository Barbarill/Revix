import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

interface Props { problemId: string; onClose: () => void }

export default function SolutionForm({ problemId, onClose }: Props) {
  const queryClient = useQueryClient()
  const [body, setBody] = useState('')
  const [shopUrl, setShopUrl] = useState('')

  const { mutate, isPending, isError } = useMutation({
    mutationFn: async () => api.post('/solutions', {
      problem_id: problemId, body,
      shop_url: shopUrl.trim() || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solutions', problemId] })
      onClose()
    },
  })

  const inputStyle = {
    width: '100%', padding: '7px 10px',
    borderRadius: 'var(--border-radius-md)',
    border: '0.5px solid var(--color-border-secondary)',
    background: 'var(--color-background-primary)',
    fontSize: 13, color: 'var(--color-text-primary)',
    outline: 'none', boxSizing: 'border-box' as const,
  }

  return (
    <div style={{
      background: 'var(--color-background-secondary)',
      borderRadius: 'var(--border-radius-md)', padding: 12, marginBottom: 10,
    }}>
      {isError && (
        <div style={{ fontSize: 12, color: '#c00', marginBottom: 8 }}>Errore durante l'invio.</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
            Descrivi la soluzione
          </label>
          <textarea value={body} onChange={e => setBody(e.target.value)} required minLength={10} rows={3}
            placeholder="Come hai risolto questo problema?"
            style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
            Link ricambio (opzionale)
          </label>
          <input type="url" value={shopUrl} onChange={e => setShopUrl(e.target.value)}
            placeholder="https://..." style={inputStyle} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => mutate()} disabled={isPending} style={{
            flex: 1, padding: '6px', borderRadius: 'var(--border-radius-md)',
            background: 'var(--color-accent)', color: '#fff', border: 'none',
            fontSize: 12, fontWeight: 500, cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.7 : 1,
          }}>
            {isPending ? 'Invio...' : 'Pubblica soluzione'}
          </button>
          <button onClick={onClose} style={{
            padding: '6px 14px', borderRadius: 'var(--border-radius-md)',
            background: 'var(--color-background-primary)', fontSize: 12,
            border: '0.5px solid var(--color-border-secondary)',
            color: 'var(--color-text-secondary)', cursor: 'pointer',
          }}>
            Annulla
          </button>
        </div>
      </div>
    </div>
  )
}