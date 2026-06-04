import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

interface User {
  id: string
  email: string
  username: string
  role: 'USER' | 'MECHANIC'
}

export function useAuth() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Legge l'utente salvato nel localStorage (se esiste)
  const storedUser = localStorage.getItem('user')
  const [user, setUser] = useState<User | null>(
    storedUser ? JSON.parse(storedUser) : null
  )

  const register = async (
    email: string,
    password: string,
    username: string,
    role: 'USER' | 'MECHANIC' = 'USER'
  ) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/auth/register', { email, password, username, role })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      setUser(res.data.user)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Errore durante la registrazione')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      setUser(res.data.user)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Credenziali non valide')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }

  return { user, loading, error, register, login, logout }
}