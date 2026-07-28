import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

interface Solution {
  id: string; body: string; shop_url: string | null
  likes_count: number; likedByMe: boolean
  created_at: string
  user: { id: string; username: string; role: string }
}

export default function SolutionList({ problemId }: { problemId: string }) {
  const storedUser = localStorage.getItem('user')
  const user = storedUser ? JSON.parse(storedUser) : null
  const queryClient = useQueryClient()

  const { data: solutions, isLoading } = useQuery<Solution[]>({
    queryKey: ['solutions', problemId],
    queryFn: async () => {
      const params = user ? { problem_id: problemId, userId: user.id } : { problem_id: problemId }
      return (await api.get('/solutions', { params })).data
    },
  })

  const { mutate: toggleLike } = useMutation({
    mutationFn: async (sol: Solution) => sol.likedByMe
      ? api.delete(`/solutions/${sol.id}/like`)
      : api.post(`/solutions/${sol.id}/like`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['solutions', problemId] }),
  })

  if (isLoading) return <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Caricamento...</p>
  if (!solutions || solutions.length === 0) return (
    <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Nessuna soluzione ancora. Sii il primo!</p>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {solutions.map(sol => (
        <div key={sol.id} style={{
          background: 'var(--color-background-secondary)',
          borderRadius: 'var(--border-radius-md)',
          padding: '10px 12px',
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          {/* Like */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, paddingTop: 2 }}>
            <button onClick={() => user && toggleLike(sol)} style={{
              background: 'none', border: 'none', cursor: user ? 'pointer' : 'default',
              color: sol.likedByMe ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              fontSize: 15, padding: 2, lineHeight: 1,
            }}>
              {sol.likedByMe ? '♥' : '♡'}
            </button>
            <span style={{ fontSize: 12, fontWeight: 500 }}>{sol.likes_count}</span>
          </div>

          {/* Contenuto */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
              👤 {sol.user.username}
              {sol.user.role === 'MECHANIC' && (
                <span style={{ fontSize: 10, background: 'var(--color-purple-light)', color: 'var(--color-purple)', padding: '1px 6px', borderRadius: 10 }}>
                  Meccanico
                </span>
              )}
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.5, margin: 0 }}>
              {sol.body}
            </p>
            {sol.shop_url && (
              <a
                href={sol.shop_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline',
                  fontSize: 12,
                  marginTop: 8,
                  color: '#185FA5',
                  textDecoration: 'none',
                }}
              >
                🛒 Ricambio su {new URL(sol.shop_url).hostname} ↗
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}