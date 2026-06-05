import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import api from '../services/api'

export default function EditProfile() {
  const navigate = useNavigate()
  const storedUser = localStorage.getItem('user')
  const me = storedUser ? JSON.parse(storedUser) : null

  const [bio, setBio] = useState('')
  const [garageName, setGarageName] = useState('')
  const [garageAddress, setGarageAddress] = useState('')
  const [mapsUrl, setMapsUrl] = useState('')
  const [website, setWebsite] = useState('')

  const { mutate, isPending, isError } = useMutation({
    mutationFn: async () => api.put('/users/me', {
      bio: bio || undefined,
      garage_name: garageName || undefined,
      garage_address: garageAddress || undefined,
      maps_url: mapsUrl || undefined,
      website: website || undefined,
    }),
    onSuccess: () => navigate(`/profile/${me?.id}`),
  })

  if (!me) return <p style={{ padding: 20, fontSize: 13 }}>Devi essere loggato.</p>

  const inputStyle = {
    width: '100%', padding: '8px 10px',
    borderRadius: 'var(--border-radius-md)',
    border: '0.5px solid var(--color-border-secondary)',
    background: 'var(--color-background-primary)',
    fontSize: 13, color: 'var(--color-text-primary)',
    outline: 'none', boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    display: 'block', fontSize: 12,
    color: 'var(--color-text-secondary)', marginBottom: 4, fontWeight: 500,
  }

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: 20 }}>
      <div style={{
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: 'var(--border-radius-lg)', padding: 20,
      }}>
        <h1 style={{ fontSize: 17, fontWeight: 500, marginBottom: 20 }}>Modifica profilo</h1>

        {isError && (
          <div style={{ fontSize: 12, color: '#c00', background: '#fee', padding: '8px 12px', borderRadius: 'var(--border-radius-md)', marginBottom: 14 }}>
            Errore durante il salvataggio.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)}
              rows={3} maxLength={300} placeholder="Raccontati in poche righe..."
              style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          {me.role === 'MECHANIC' && (
            <>
              <div style={{ borderTop: '0.5px solid var(--color-border-tertiary)', paddingTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Dati officina
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Nome officina</label>
                    <input type="text" value={garageName} onChange={e => setGarageName(e.target.value)}
                      placeholder="Es. Officina Rossi" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Indirizzo</label>
                    <input type="text" value={garageAddress} onChange={e => setGarageAddress(e.target.value)}
                      placeholder="Via Roma 1, Milano" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Link Google Maps</label>
                    <input type="url" value={mapsUrl} onChange={e => setMapsUrl(e.target.value)}
                      placeholder="https://maps.google.com/..." style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Sito web (opzionale)</label>
                    <input type="url" value={website} onChange={e => setWebsite(e.target.value)}
                      placeholder="https://..." style={inputStyle} />
                  </div>
                </div>
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button onClick={() => mutate()} disabled={isPending} style={{
              flex: 1, padding: '8px',
              borderRadius: 'var(--border-radius-md)',
              background: 'var(--color-accent)', color: '#fff',
              border: 'none', fontSize: 13, fontWeight: 500,
              cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.7 : 1,
            }}>
              {isPending ? 'Salvataggio...' : 'Salva modifiche'}
            </button>
            <button onClick={() => navigate(`/profile/${me.id}`)} style={{
              padding: '8px 16px', borderRadius: 'var(--border-radius-md)',
              background: 'var(--color-background-secondary)',
              border: '0.5px solid var(--color-border-secondary)',
              fontSize: 13, color: 'var(--color-text-secondary)', cursor: 'pointer',
            }}>
              Annulla
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}