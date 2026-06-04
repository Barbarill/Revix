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
  created_at: string
  user: { id: string; username: string; role: string }
}

interface Props {
  official: Problem[]
  pending: Problem[]
}

export default function ProblemList({ official, pending }: Props) {
  return (
    <div>
      {/* Problemi ufficiali */}
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
          {official.map(p => <ProblemCard key={p.id} problem={p} />)}
        </div>
      )}

      {/* Problemi in attesa */}
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
          {pending.map(p => <ProblemCard key={p.id} problem={p} />)}
        </div>
      )}
    </div>
  )
}

function ProblemCard({ problem }: { problem: Problem }) {
  return (
    <div style={{
      background: '#1a1a1a', border: '1px solid #2a2a2a',
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

        <div style={{ textAlign: 'center', minWidth: 60 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: problem.is_official ? '#4c4' : '#888' }}>
            {problem.confirm_count}
          </div>
          <div style={{ fontSize: 11, color: '#555' }}>conferme</div>
        </div>
      </div>
    </div>
  )
}