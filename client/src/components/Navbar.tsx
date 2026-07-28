import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import SearchBar from './SearchBar'
import api from '../services/api'

interface Notification {
  id: string
  message: string
  is_read: boolean
  created_at: string
  problem: { id: string; title: string; car_id: string }
  sender: { username: string; role: string }
}

const NAV_LINKS = [
  { label: 'Catalogo',  to: '/' },
  { label: 'Community', to: '/community' },
  { label: 'Officine',  to: '/officine' },
  { label: 'Ricambi',   to: '/ricambi' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()                              // ← per link attivo
  const storedUser = localStorage.getItem('user')
  const user = storedUser ? JSON.parse(storedUser) : null
  const queryClient = useQueryClient()
  const [showNotifications, setShowNotifications] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)

  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/notifications')).data,
    enabled: !!user,
    refetchInterval: 30000,
  })

  const unreadCount = notifications?.filter(n => !n.is_read).length ?? 0

  const { mutate: markAllRead } = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const openNotifications = () => {
    setShowNotifications(v => !v)
    if (!showNotifications && unreadCount > 0) markAllRead()
  }

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
      {/* Logo */}
      <Link to="/" style={{
        fontSize: 17, fontWeight: 500, color: 'var(--color-text-primary)',
        display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
      }}>
        <span>🔧</span>
        <span>Re<span style={{ color: 'var(--color-accent)' }}>vix</span></span>
      </Link>

      {/* Nav-links ← fix 2.16 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
        {NAV_LINKS.map(link => {
          const isActive = location.pathname === link.to
          return (
            <Link
              key={link.to}
              to={link.to}
              style={{
                fontSize: 13, padding: '5px 10px',
                color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                fontWeight: isActive ? 500 : 400,
                textDecoration: 'none',
                borderBottom: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
                lineHeight: '20px',
              }}
            >
              {link.label}
            </Link>
          )
        })}
      </div>

      {/* SearchBar — spostata a destra dei nav-links, maxWidth 280px */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', padding: '0 8px' }}>
        <div style={{ maxWidth: 280, width: '100%' }}>
          <SearchBar />
        </div>
      </div>

      {/* Destra — notifiche + utente */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>

        {user && (
          <div ref={bellRef} style={{ position: 'relative' }}>
            <button
              onClick={openNotifications}
              style={{
                position: 'relative', background: 'none',
                border: '0.5px solid var(--color-border-secondary)',
                borderRadius: 'var(--border-radius-md)', padding: '5px 10px',
                cursor: 'pointer', fontSize: 15, lineHeight: 1,
                color: 'var(--color-text-primary)',
              }}
            >
              🔔
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  background: 'var(--color-accent)', color: '#fff',
                  fontSize: 10, fontWeight: 700,
                  width: 16, height: 16, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1,
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                width: 320,
                background: 'var(--color-background-primary)',
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: 8,
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                zIndex: 200, overflow: 'hidden',
              }}>
                <div style={{
                  padding: '10px 14px',
                  fontSize: 12, fontWeight: 600,
                  borderBottom: '0.5px solid var(--color-border-tertiary)',
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  Notifiche
                </div>
                {!notifications || notifications.length === 0 ? (
                  <div style={{ padding: '16px 14px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    Nessuna notifica
                  </div>
                ) : (
                  <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          setShowNotifications(false)
                          navigate(`/cars/${n.problem.car_id}#problem-${n.problem.id}`)
                        }}
                        style={{
                          padding: '10px 14px',
                          borderBottom: '0.5px solid var(--color-border-tertiary)',
                          cursor: 'pointer',
                          background: n.is_read ? 'transparent' : 'var(--color-accent-light)',
                          display: 'flex', gap: 8, alignItems: 'flex-start',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-background-secondary)')}
                        onMouseLeave={e => (e.currentTarget.style.background = n.is_read ? 'transparent' : 'var(--color-accent-light)')}
                      >
                        <span style={{ fontSize: 14, marginTop: 1 }}>🔔</span>
                        <div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                            {n.message}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                            {new Date(n.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

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