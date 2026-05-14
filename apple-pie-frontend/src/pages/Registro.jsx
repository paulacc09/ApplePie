import { useId, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getErrorMessage } from '../lib/apiError.js'

const semestres = Array.from({ length: 10 }, (_, i) => i + 1)

export default function Registro() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const nombreId = useId()
  const emailId = useId()
  const passwordId = useId()
  const confirmId = useId()
  const uniId = useId()
  const progId = useId()
  const semId = useId()
  const edadId = useId()
  const errorId = useId()

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [universidad, setUniversidad] = useState('')
  const [programa, setPrograma] = useState('')
  const [semestre, setSemestre] = useState('1')
  const [edad, setEdad] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    const payload = {
      nombre: nombre.trim(),
      email: email.trim(),
      password,
      universidad: universidad.trim(),
      programa: programa.trim(),
      semestre: Number(semestre),
      edad: Number(edad),
    }

    if (!payload.nombre || !payload.email || !payload.universidad || !payload.programa || !edad) {
      setError('Completa todos los campos obligatorios.')
      return
    }
    if (Number.isNaN(payload.edad) || payload.edad < 1) {
      setError('Indica una edad válida.')
      return
    }

    setLoading(true)
    try {
      await register(payload)
      navigate('/login', { replace: true, state: { registered: true } })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'mt-1 w-full rounded-xl border border-[#F9C5D1] bg-[#FFF8F0] px-3 py-2.5 text-gray-900 transition-all duration-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white'

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2] px-4 py-10 dark:bg-gray-950">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-8 shadow-md dark:bg-gray-900">
        <div className="text-center">
          <span className="text-4xl" aria-hidden="true">
            🍎
          </span>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">Crea tu cuenta</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Únete a Apple Pie</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor={nombreId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Nombre completo
            </label>
            <input
              id={nombreId}
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={inputClass}
              aria-required="true"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
            />
          </div>
          <div>
            <label htmlFor={emailId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Correo institucional
            </label>
            <input
              id={emailId}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor={passwordId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Contraseña
            </label>
            <div className="relative mt-1">
              <input
                id={passwordId}
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pr-12`}
                aria-required="true"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm text-[#6C63FF]"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor={confirmId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirmar contraseña
            </label>
            <input
              id={confirmId}
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputClass}
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor={uniId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Universidad
            </label>
            <input
              id={uniId}
              type="text"
              required
              value={universidad}
              onChange={(e) => setUniversidad(e.target.value)}
              className={inputClass}
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor={progId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Programa
            </label>
            <input
              id={progId}
              type="text"
              required
              value={programa}
              onChange={(e) => setPrograma(e.target.value)}
              className={inputClass}
              aria-required="true"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={semId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Semestre
              </label>
              <select
                id={semId}
                required
                value={semestre}
                onChange={(e) => setSemestre(e.target.value)}
                className={inputClass}
                aria-required="true"
              >
                {semestres.map((s) => (
                  <option key={s} value={String(s)}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={edadId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Edad
              </label>
              <input
                id={edadId}
                type="number"
                required
                min={1}
                max={120}
                value={edad}
                onChange={(e) => setEdad(e.target.value)}
                className={inputClass}
                aria-required="true"
              />
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
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link to="/login" className="font-medium text-[#6C63FF] underline-offset-2 hover:underline">
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
