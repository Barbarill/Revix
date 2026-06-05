import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import SolutionList from './SolutionList'
import SolutionForm from './SolutionForm'

const CATEGORY_ICONS: Record<string, string> = {
  MOTOR: '🔧', ELECTRONICS: '⚡', BRAKES: '🛑', SUSPENSION: '🔩', BODYWORK: '🚗',
}
const CATEGORY_LABELS: Record<string, string> = {
  MOTOR: 'Motore', ELECTRONICS: 'Elettronica', BRAKES: 'Freni', SUSPENSION: 'Sospensioni', BODYWORK: 'Carrozzeria',
}
const CATEGORY_STYLE: Record<string, { bg: string; color: string }> = {
  MOTOR:       { bg: '#FAECE7', color: '#993C1D' },
  ELECTRONICS: { bg: '#E6F1FB', color: '#185FA5' },
  BRAKES:      { bg: '#FEF3E2', color: '#A05C00' },
  SUSPENSION:  { bg: '#F1EFE8', color: '#5F5E5A' },
  BODYWORK:    { bg: '#E6F1FB', color: '#185FA5' },
}

interface Problem {
  id: string; title: string; description: string
  category: string; confirm_count: number
  is_official: boolean; confirmedByMe: boolean
  created_at: string
  user: { id: string; username: string; role: string }
}

interface Props { official: Problem[]; pending: Problem[]; carId: string }

export default function ProblemList({ official, pending, carId }: Props) {
  return (
    <div>
      <SectionTitle icon="✅" label="Problemi confermati" count={official.length} />
      {official.length === 0
        ? <Empty text="Nessun problema confermato ancora." />
        : official.map(p => <ProblemCard key={p.id} problem={p} carId={carId} />)
      }

      <div style={{ marginTop: 20 }}>
        <SectionTitle icon="⏳" label="In attesa di conferme" count={pending.length} />
        {pending.length === 0
          ? <Empty text="Nessuna segnalazione in attesa." />
          : pending.map(p => <ProblemCard key={p.id} problem={p} carId={carId} />)
        }
      </div>
    </div>
  )
}

function SectionTitle({ icon, label, count }: { icon: string; label: string; count: number }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
      {icon} {label}
      <span style={{ fontSize: 11, background: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)', padding: '1px 6px', borderRadius: 20 }}>
        {count}
      </span>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16 }}>{text}</p>
}

function ProblemCard({ problem, carId }: { problem: Problem; carId: string }) {
  const queryClient = useQueryClient()
  const [showSolutions, setShowSolutions] = useState(false)
  const [showSolutionForm, setShowSolutionForm] = useState(false)
  const storedUser = localStorage.getItem('user')
  const user = storedUser ? JSON.parse(storedUser) : null
  const isOwnProblem = user?.id === problem.user.id
  const catStyle = CATEGORY_STYLE[problem.category] ?? { bg: '#F1EFE8', color: '#5F5E5A' }

  const { mutate: toggleConfirm, isPending } = useMutation({
    mutationFn: async () => problem.confirmedByMe
      ? api.delete(`/problems/${problem.id}/confirm`)
      : api.post(`/problems/${problem.id}/confirm`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['problems', carId] }),
  })

  return (
    <div style={{
      background: 'var(--color-background-primary)',
      border: '0.5px solid var(--color-border-tertiary)',
      borderRadius: 'var(--border-radius-lg)',
      padding: '12px 14px', marginBottom: 8,
    }}>
      {/* Top */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 'var(--border-radius-md)',
          background: catStyle.bg, color: catStyle.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, flexShrink: 0,
        }}>
          {CATEGORY_ICONS[problem.category]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{problem.title}</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 20, background: catStyle.bg, color: catStyle.color }}>
              {CATEGORY_LABELS[problem.category]}
            </span>
          </div>
        </div>
      </div>

      {/* Descrizione */}
      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>
        {problem.description}
      </p>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {user && !isOwnProblem && (
          <button onClick={() => toggleConfirm()} disabled={isPending} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 12, padding: '3px 10px', borderRadius: 20, cursor: 'pointer',
            border: `0.5px solid ${problem.confirmedByMe ? 'var(--color-green-border)' : 'var(--color-border-tertiary)'}`,
            background: problem.confirmedByMe ? 'var(--color-green-light)' : 'var(--color-background-primary)',
            color: problem.confirmedByMe ? 'var(--color-green)' : 'var(--color-text-secondary)',
            opacity: isPending ? 0.6 : 1,
          }}>
            {problem.confirmedByMe ? '✓ Confermato' : '+ Conferma anche tu'}
          </button>
        )}

        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-green)', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          👥 {problem.confirm_count} conferme
        </span>

        <button onClick={() => setShowSolutions(v => !v)} style={{
          fontSize: 12, padding: '3px 10px', borderRadius: 20,
          border: `0.5px solid ${showSolutions ? 'var(--color-accent)' : 'var(--color-border-tertiary)'}`,
          color: showSolutions ? 'var(--color-accent)' : 'var(--color-text-secondary)',
          background: 'none', cursor: 'pointer',
        }}>
          {showSolutions ? 'Nascondi soluzioni' : 'Vedi soluzioni ↗'}
        </button>
      </div>

      {/* Soluzioni */}
      {showSolutions && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '0.5px solid var(--color-border-tertiary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>💡 Soluzioni</span>
            {user && (
              <button onClick={() => setShowSolutionForm(v => !v)} style={{
                fontSize: 12, padding: '3px 10px', borderRadius: 20,
                background: showSolutionForm ? 'var(--color-background-secondary)' : 'var(--color-accent)',
                color: showSolutionForm ? 'var(--color-text-secondary)' : '#fff',
                border: '0.5px solid ' + (showSolutionForm ? 'var(--color-border-secondary)' : 'var(--color-accent)'),
                cursor: 'pointer',
              }}>
                {showSolutionForm ? 'Annulla' : '+ Aggiungi soluzione'}
              </button>
            )}
          </div>
          {showSolutionForm && (
            <SolutionForm problemId={problem.id} onClose={() => setShowSolutionForm(false)} />
          )}
          <SolutionList problemId={problem.id} />
        </div>
      )}
    </div>
  )
}