import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { login, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const inputStyle = {
    width: '100%', padding: '8px 10px', borderRadius: 'var(--border-radius-md)',
    border: '0.5px solid var(--color-border-secondary)',
    background: 'var(--color-background-primary)',
    fontSize: 13, color: 'var(--color-text-primary)', outline: 'none', boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{
        width: '100%', maxWidth: 380,
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: 'var(--border-radius-lg)', padding: 24,
      }}>
        <h1 style={{ fontSize: 17, fontWeight: 500, marginBottom: 4 }}>Accedi a Revix</h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 20 }}>
          Non hai un account? <Link to="/register" style={{ color: 'var(--color-accent)' }}>Registrati</Link>
        </p>

        {error && (
          <div style={{ fontSize: 12, color: '#c00', background: '#fee', padding: '8px 12px', borderRadius: 'var(--border-radius-md)', marginBottom: 14 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4, fontWeight: 500 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="test@test.com" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4, fontWeight: 500 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••" style={inputStyle} />
          </div>
          <button onClick={() => login(email, password)} disabled={loading} style={{
            width: '100%', padding: '8px', borderRadius: 'var(--border-radius-md)',
            background: 'var(--color-accent)', color: '#fff', border: 'none',
            fontSize: 13, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 4,
          }}>
            {loading ? 'Accesso...' : 'Accedi'}
          </button>
        </div>
      </div>
    </div>
  )
}