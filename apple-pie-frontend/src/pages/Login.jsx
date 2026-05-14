import { useId, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getErrorMessage } from '../lib/apiError.js'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const registered = location.state?.registered

  const emailId = useId()
  const passwordId = useId()
  const errorId = useId()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Completa correo y contraseña.')
      return
    }
    setLoading(true)
    try {
      await login(email.trim(), password)
      const to = location.state?.from && location.state.from !== '/login' ? location.state.from : '/home'
      navigate(to, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2] px-4 py-10 dark:bg-gray-950">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-md dark:bg-gray-900">
        {registered ? (
          <p className="mb-4 rounded-xl bg-[#A8B5A2]/20 px-3 py-2 text-center text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            Cuenta creada. Inicia sesión con tus datos.
          </p>
        ) : null}

        <div className="text-center">
          <span className="text-4xl" aria-hidden="true">
            🍎
          </span>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">Bienvenida de vuelta</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Ingresa a tu comunidad</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor={emailId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Correo electrónico
            </label>
            <input
              id={emailId}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#F9C5D1] bg-[#FFF8F0] px-3 py-2.5 text-gray-900 transition-all duration-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              aria-required="true"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
            />
          </div>

          <div>
            <label htmlFor={passwordId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Contraseña
            </label>
            <div className="relative mt-1">
              <input
                id={passwordId}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#F9C5D1] bg-[#FFF8F0] py-2.5 pl-3 pr-12 text-gray-900 transition-all duration-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                aria-required="true"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm text-[#6C63FF] transition-all duration-200 hover:bg-[#FAF7F2] dark:hover:bg-gray-700"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error ? (
            <div
              id={errorId}
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
            >
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#6C63FF] py-3 font-medium text-white transition-all duration-200 hover:bg-[#5855d6] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center text-sm">
          <Link to="/registro" className="block font-medium text-[#6C63FF] underline-offset-2 hover:underline">
            ¿No tienes cuenta? Regístrate
          </Link>
          <button
            type="button"
            className="text-gray-500 transition-all duration-200 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Olvidé mi contraseña
          </button>
        </div>
      </div>
    </div>
  )
}
