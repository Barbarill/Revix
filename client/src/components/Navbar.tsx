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
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '12px 20px',
      background: 'var(--color-background-primary)',
      borderBottom: '0.5px solid var(--color-border-tertiary)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <Link to="/" style={{ fontSize: 17, fontWeight: 500, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>🔧</span><span>Re<span style={{ color: 'var(--color-accent)' }}>vix</span></span>
      </Link>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 'auto' }}>
        {user ? (
          <>
            <Link to={`/profile/${user.id}`} style={{
                fontSize: 13, color: 'var(--color-text-primary)',
                padding: '5px 10px', borderRadius: 'var(--border-radius-md)',
                display: 'flex', alignItems: 'center', gap: 6,
                border: '0.5px solid var(--color-border-secondary)',
                background: 'var(--color-background-secondary)',
                }}>
                👤 {user.username}
                {user.role === 'MECHANIC' && (
                    <span style={{ fontSize: 10, background: 'var(--color-purple-light)', color: 'var(--color-purple)', padding: '1px 6px', borderRadius: 10, fontWeight: 500 }}>
                    Meccanico
                    </span>
                )}
                </Link>
            <button onClick={logout} style={{
              fontSize: 13, padding: '5px 14px',
              borderRadius: 'var(--border-radius-md)',
              border: '0.5px solid var(--color-border-secondary)',
              background: 'var(--color-background-primary)',
              color: 'var(--color-text-primary)', cursor: 'pointer',
            }}>
              Esci
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{
              fontSize: 13, padding: '5px 14px',
              borderRadius: 'var(--border-radius-md)',
              border: '0.5px solid var(--color-border-secondary)',
              background: 'var(--color-background-primary)',
              color: 'var(--color-text-primary)',
            }}>
              Accedi
            </Link>
            <Link to="/register" style={{
              fontSize: 13, padding: '5px 14px',
              borderRadius: 'var(--border-radius-md)',
              background: 'var(--color-accent)', color: '#fff',
              border: '0.5px solid var(--color-accent)',
            }}>
              Registrati
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}