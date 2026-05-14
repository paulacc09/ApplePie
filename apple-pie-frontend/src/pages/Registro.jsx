import { useId, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LogoApplePie from '../components/LogoApplePie.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getErrorMessage } from '../lib/apiError.js'

const semestres = Array.from({ length: 10 }, (_, i) => i + 1)

const FLORAL_BG = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23E8B4BC' fill-opacity='0.15'%3E%3Cpath d='M30 30 C30 20 20 15 15 20 C10 25 15 35 25 32 C20 40 25 48 30 45 C35 48 40 40 35 32 C45 35 50 25 45 20 C40 15 30 20 30 30Z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`

const field =
  'w-full rounded-xl border border-rose bg-white px-4 py-3 text-ink placeholder:text-faded transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose'

export default function Registro() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const nombreId = useId()
  const apellidoId = useId()
  const emailId = useId()
  const passwordId = useId()
  const confirmId = useId()
  const uniId = useId()
  const progId = useId()
  const semId = useId()
  const edadId = useId()
  const errorId = useId()
  const termsId = useId()

  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
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
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!acceptedTerms) {
      setError('Debes aceptar los términos para continuar.')
      return
    }

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
      apellido: apellido.trim(),
      email: email.trim(),
      password,
      universidad: universidad.trim(),
      programa: programa.trim(),
      semestre: Number(semestre),
      edad: Number(edad),
    }

    if (!payload.nombre || !payload.apellido || !payload.email || !payload.universidad || !payload.programa || !edad) {
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

  return (
    <div
      className="min-h-screen overflow-y-auto bg-cream py-8"
      style={{ backgroundImage: FLORAL_BG }}
    >
      <div className="mx-auto w-full max-w-lg px-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-4 flex items-center gap-1 text-xs text-muted hover:text-ink"
        >
          ← Volver al inicio
        </button>
        <div className="rounded-3xl border border-line bg-white/90 p-8 shadow-xl backdrop-blur-sm">
          <div className="flex justify-center">
            <LogoApplePie />
          </div>
          <h1 className="mt-4 text-center font-display text-2xl text-ink">Crear Cuenta</h1>
          <p className="mt-1 text-center text-sm text-stone">Únete a la comunidad</p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={nombreId} className="text-sm font-medium text-ink">
                  Nombre
                </label>
                <input
                  id={nombreId}
                  name="nombre"
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  className={`${field} mt-1`}
                  aria-required="true"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? errorId : undefined}
                />
              </div>
              <div>
                <label htmlFor={apellidoId} className="text-sm font-medium text-ink">
                  Apellido
                </label>
                <input
                  id={apellidoId}
                  name="apellido"
                  type="text"
                  required
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Tu apellido"
                  className={`${field} mt-1`}
                  aria-required="true"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? errorId : undefined}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={emailId} className="text-sm font-medium text-ink">
                  Correo institucional
                </label>
                <input
                  id={emailId}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${field} mt-1`}
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor={passwordId} className="text-sm font-medium text-ink">
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
                    className={`${field} pr-12`}
                    aria-required="true"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-faded hover:text-rose-dark"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor={confirmId} className="text-sm font-medium text-ink">
                  Confirmar contraseña
                </label>
                <input
                  id={confirmId}
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={`${field} mt-1`}
                  aria-required="true"
                />
              </div>
            </div>

            <p className="pt-2 text-xs font-medium uppercase tracking-wider text-olive">Información académica</p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={uniId} className="text-sm font-medium text-ink">
                  Universidad
                </label>
                <input
                  id={uniId}
                  type="text"
                  required
                  value={universidad}
                  onChange={(e) => setUniversidad(e.target.value)}
                  className={`${field} mt-1`}
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor={progId} className="text-sm font-medium text-ink">
                  Programa
                </label>
                <input
                  id={progId}
                  type="text"
                  required
                  value={programa}
                  onChange={(e) => setPrograma(e.target.value)}
                  className={`${field} mt-1`}
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor={semId} className="text-sm font-medium text-ink">
                  Semestre
                </label>
                <select
                  id={semId}
                  required
                  value={semestre}
                  onChange={(e) => setSemestre(e.target.value)}
                  className={`${field} mt-1 appearance-none bg-white`}
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
                <label htmlFor={edadId} className="text-sm font-medium text-ink">
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
                  className={`${field} mt-1`}
                  aria-required="true"
                />
              </div>
            </div>

            <div className="flex items-start gap-2 pt-2">
              <input
                id={termsId}
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-rose text-rose focus:ring-rose"
                style={{ accentColor: '#E8B4BC' }}
              />
              <label htmlFor={termsId} className="text-sm text-stone">
                Acepto los{' '}
                <a href="#terminos" className="font-medium text-rose-dark underline-offset-2 hover:underline">
                  términos y condiciones
                </a>
              </label>
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
              className="w-full rounded-xl bg-rose px-5 py-2.5 font-medium text-ink shadow-sm transition-all duration-200 hover:bg-rose-dark hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone">
            <Link to="/login" className="font-medium text-rose-dark underline-offset-4 hover:underline">
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
