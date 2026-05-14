import { useId, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import LogoApplePie from '../components/LogoApplePie.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getErrorMessage } from '../lib/apiError.js'

const FLORAL_BG = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23E8B4BC' fill-opacity='0.15'%3E%3Cpath d='M30 30 C30 20 20 15 15 20 C10 25 15 35 25 32 C20 40 25 48 30 45 C35 48 40 40 35 32 C45 35 50 25 45 20 C40 15 30 20 30 30Z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`

const field =
  'w-full rounded-xl border border-rose bg-white px-4 py-3 text-ink placeholder:text-faded transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose'

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
    <div
      className="relative h-screen w-full overflow-hidden bg-cream"
      style={{ backgroundImage: FLORAL_BG }}
    >
      <div className="absolute left-1/2 top-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 px-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-4 flex items-center gap-1 text-xs text-muted hover:text-ink"
        >
          ← Volver al inicio
        </button>
        <div className="rounded-3xl border border-line bg-white/90 p-8 shadow-xl backdrop-blur-sm">
          {registered ? (
            <p className="mb-6 rounded-xl border border-olive-light bg-mint px-3 py-2 text-center text-sm text-ink">
              Cuenta creada. Inicia sesión con tus datos.
            </p>
          ) : null}

          <div className="mb-8 flex justify-center">
            <LogoApplePie />
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor={emailId} className="text-sm font-medium text-ink">
                Email
              </label>
              <input
                id={emailId}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${field} mt-1`}
                aria-required="true"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
              />
            </div>

            <div>
              <label htmlFor={passwordId} className="text-sm font-medium text-ink">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id={passwordId}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${field} pr-12`}
                  aria-required="true"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? errorId : undefined}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-faded transition-colors hover:text-rose-dark"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="text-right">
              <button type="button" className="text-xs text-faded transition-colors hover:text-rose-dark">
                Forgot password?
              </button>
            </div>

            {error ? (
              <div
                id={errorId}
                role="alert"
                className="rounded-xl border border-rose bg-blush px-4 py-3 text-sm text-rose-dark"
              >
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-rose px-5 py-2.5 font-medium text-ink shadow-sm transition-all duration-200 hover:bg-rose-dark hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wide text-faded">
              <span className="bg-white/90 px-2">o</span>
            </div>
          </div>

          <p className="text-center text-sm text-stone">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="font-medium text-rose-dark underline-offset-4 hover:underline">
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
