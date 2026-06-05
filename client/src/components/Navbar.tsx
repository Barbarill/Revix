import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const storedUser = localStorage.getItem('user')
  const user = storedUser ? JSON.parse(storedUser) : null

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <nav style={{
      background: '#111', borderBottom: '1px solid #222',
      padding: '0 24px', height: 56,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      <Link to="/" style={{ color: '#e63', fontWeight: 800, fontSize: 20, textDecoration: 'none' }}>
        Revix
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {user ? (
          <>
            <span style={{ color: '#888', fontSize: 14 }}>
              {user.username}
              {user.role === 'MECHANIC' && (
                <span style={{ color: '#e63', marginLeft: 6, fontSize: 11, fontWeight: 600 }}>🔧 MECCANICO</span>
              )}
            </span>
            <button
              onClick={logout}
              style={{ padding: '6px 14px', borderRadius: 8, background: '#222', color: '#aaa', border: '1px solid #333', cursor: 'pointer', fontSize: 13 }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#aaa', fontSize: 14, textDecoration: 'none' }}>Accedi</Link>
            <Link to="/register" style={{ padding: '6px 14px', borderRadius: 8, background: '#e63', color: '#fff', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>Registrati</Link>
          </>
        )}
      </div>
    </nav>
  )
}