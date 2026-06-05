import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

const CATEGORY_ICONS: Record<string, string> = {
  MOTOR: '🔧',
  ELECTRONICS: '⚡',
  BRAKES: '🛑',
  SUSPENSION: '🔩',
  BODYWORK: '🚗',
}

interface Problem {
  id: string
  title: string
  description: string
  category: string
  confirm_count: number
  is_official: boolean
  confirmedByMe: boolean
  created_at: string
  user: { id: string; username: string; role: string }
}

interface Props {
  official: Problem[]
  pending: Problem[]
  carId: string
}

export default function ProblemList({ official, pending, carId }: Props) {
  return (
    <div>
      <h2 style={{ color: '#fff', fontSize: 18, marginBottom: 12 }}>
        ✅ Problemi confermati
        <span style={{ color: '#666', fontWeight: 400, fontSize: 14, marginLeft: 8 }}>
          ({official.length})
        </span>
      </h2>

      {official.length === 0 ? (
        <p style={{ color: '#555', fontSize: 14, marginBottom: 32 }}>
          Nessun problema confermato ancora.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
          {official.map(p => <ProblemCard key={p.id} problem={p} carId={carId} />)}
        </div>
      )}

      <h2 style={{ color: '#fff', fontSize: 18, marginBottom: 12 }}>
        ⏳ In attesa di conferme
        <span style={{ color: '#666', fontWeight: 400, fontSize: 14, marginLeft: 8 }}>
          ({pending.length})
        </span>
      </h2>

      {pending.length === 0 ? (
        <p style={{ color: '#555', fontSize: 14 }}>
          Nessuna segnalazione in attesa.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pending.map(p => <ProblemCard key={p.id} problem={p} carId={carId} />)}
        </div>
      )}
    </div>
  )
}

function ProblemCard({ problem, carId }: { problem: Problem; carId: string }) {
  const queryClient = useQueryClient()
  const storedUser = localStorage.getItem('user')
  const user = storedUser ? JSON.parse(storedUser) : null

  const { mutate: toggleConfirm, isPending } = useMutation({
    mutationFn: async () => {
      if (problem.confirmedByMe) {
        await api.delete(`/problems/${problem.id}/confirm`)
      } else {
        await api.post(`/problems/${problem.id}/confirm`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems', carId] })
    },
  })

  const isOwnProblem = user?.id === problem.user.id

  return (
    <div style={{
      background: '#1a1a1a', border: `1px solid ${problem.is_official ? '#2a4a2a' : '#2a2a2a'}`,
      borderRadius: 12, padding: '16px 20px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 16 }}>{CATEGORY_ICONS[problem.category]}</span>
            <h3 style={{ margin: 0, color: '#fff', fontSize: 15 }}>{problem.title}</h3>
          </div>
          <p style={{ margin: 0, color: '#777', fontSize: 13, lineHeight: 1.5 }}>
            {problem.description}
          </p>
          <p style={{ margin: '10px 0 0', color: '#555', fontSize: 12 }}>
            Segnalato da{' '}
            <span style={{ color: '#888' }}>{problem.user.username}</span>
            {problem.user.role === 'MECHANIC' && (
              <span style={{ color: '#e63', marginLeft: 6, fontSize: 11, fontWeight: 600 }}>🔧 MECCANICO</span>
            )}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 90 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: problem.is_official ? '#4c4' : '#888' }}>
              {problem.confirm_count}
            </div>
            <div style={{ fontSize: 11, color: '#555' }}>
              {problem.is_official ? 'ufficiale' : `di 5`}
            </div>
          </div>

          {user && !isOwnProblem && (
            <button
              onClick={() => toggleConfirm()}
              disabled={isPending}
              style={{
                padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                cursor: isPending ? 'not-allowed' : 'pointer',
                background: problem.confirmedByMe ? '#2a4a2a' : '#222',
                color: problem.confirmedByMe ? '#4c4' : '#aaa',
                border: `1px solid ${problem.confirmedByMe ? '#4c4' : '#444'}`,
                opacity: isPending ? 0.6 : 1,
                transition: 'all 0.2s',
              } as React.CSSProperties}
            >
              {problem.confirmedByMe ? '✓ Confermato' : '+ Conferma'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}