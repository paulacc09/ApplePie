/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/axios.js'

const TOKEN_KEY = 'apple-pie-token'
const USER_KEY = 'apple-pie-user'

const AuthContext = createContext(null)

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => readStoredUser())
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading] = useState(false)

  const login = useCallback(async (email, password, rol) => {
    const { data } = await api.post('/api/auth/login', { email, password, rol })
    const nextToken = data.token ?? data.accessToken ?? data.access_token
    const nextUser = data.user ?? data.usuario ?? null
    if (!nextToken) {
      throw new Error('Respuesta inválida del servidor')
    }
    localStorage.setItem(TOKEN_KEY, nextToken)
    if (nextUser && typeof nextUser === 'object') {
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
      setUser(nextUser)
    } else {
      localStorage.removeItem(USER_KEY)
      setUser(null)
    }
    setToken(nextToken)
    return data
  }, [])

  const register = useCallback(async (datos) => {
    const { data } = await api.post('/api/auth/register', datos)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
    navigate('/login', { replace: true })
  }, [navigate])

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
    }),
    [user, token, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return ctx
}
