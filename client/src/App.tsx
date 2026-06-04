import { Link } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

export default function App() {
  const { user, logout } = useAuth()

  return (
    <div style={{ maxWidth: 600, margin: '80px auto', padding: '0 16px', textAlign: 'center' }}>
      <h1 style={{ fontSize: 48, fontWeight: 800, color: '#e63' }}>Revix</h1>
      <p style={{ color: '#888', marginBottom: 40 }}>La community per i problemi della tua auto</p>

      {user ? (
        <div>
          <p style={{ marginBottom: 24 }}>
            Benvenuto, <strong>{user.username}</strong>!{' '}
            <span style={{ color: '#888', fontSize: 14 }}>({user.role})</span>
          </p>
          <button
            onClick={logout}
            style={{ padding: '10px 24px', borderRadius: 8, background: '#333', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Link
            to="/login"
            style={{ padding: '12px 32px', borderRadius: 8, background: '#e63', color: '#fff', textDecoration: 'none', fontWeight: 600 }}
          >
            Accedi
          </Link>
          <Link
            to="/register"
            style={{ padding: '12px 32px', borderRadius: 8, background: '#222', color: '#fff', textDecoration: 'none', fontWeight: 600, border: '1px solid #444' }}
          >
            Registrati
          </Link>
        </div>
      )}
    </div>
  )
}