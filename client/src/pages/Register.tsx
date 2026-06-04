import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Register() {
  const { register, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [role, setRole] = useState<'USER' | 'MECHANIC'>('USER')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    register(email, password, username, role)
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: '0 16px' }}>
      <h1 style={{ marginBottom: 8 }}>Crea il tuo account</h1>
      <p style={{ color: '#888', marginBottom: 32 }}>
        Hai già un account? <Link to="/login">Accedi</Link>
      </p>

      {error && (
        <div style={{ background: '#fee', color: '#c00', padding: '12px 16px', borderRadius: 8, marginBottom: 20 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            minLength={3}
            placeholder="il_tuo_username"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #333', background: '#111', color: '#fff', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="test@test.com"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #333', background: '#111', color: '#fff', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="minimo 6 caratteri"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #333', background: '#111', color: '#fff', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Tipo account</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value as 'USER' | 'MECHANIC')}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #333', background: '#111', color: '#fff', boxSizing: 'border-box' }}
          >
            <option value="USER">Utente — cerco soluzioni per la mia auto</option>
            <option value="MECHANIC">Meccanico — offro soluzioni tecniche</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ padding: '12px', borderRadius: 8, background: '#e63', color: '#fff', border: 'none', fontWeight: 600, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Registrazione in corso...' : 'Crea account'}
        </button>
      </form>
    </div>
  )
}