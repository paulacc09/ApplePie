import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const comunidadesMock = [
  { id: '1', nombre: 'Cálculo III — Grupo A' },
  { id: '2', nombre: 'Física moderna' },
  { id: '3', nombre: 'Álgebra lineal' },
]

const sesionesMock = [
  { id: '1', nombre: 'Sofía R.', titulo: 'Cálculo III con Sofía R.', fecha: '12 May 2026' },
  { id: '2', nombre: 'Laura M.', titulo: 'Álgebra con Laura M.', fecha: '2 May 2026' },
]

export default function MiPerfil() {
  const { user } = useAuth()
  const nombre = user?.nombre ?? user?.name ?? 'Estudiante'
  const email = user?.email ?? ''
  const carrera = user?.carrera ?? user?.programa ?? 'Ingeniería · Universidad'
  const inicial = (nombre || '?').trim().charAt(0).toUpperCase()

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-10">
      <header className="relative rounded-2xl border border-line bg-white p-6">
        <button
          type="button"
          className="absolute right-4 top-4 rounded-xl border border-rose bg-white px-3 py-1.5 text-xs font-medium text-rose-dark transition-all hover:bg-rose-light"
        >
          Editar perfil
        </button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-rose text-2xl font-semibold text-ink">
            {inicial}
          </div>
          <div>
            <h1 className="font-display text-xl text-ink">{nombre}</h1>
            <p className="text-sm text-stone">{carrera}</p>
            {email ? <p className="mt-1 text-xs text-faded">{email}</p> : null}
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1 rounded-2xl bg-cream p-4 text-center">
          <p className="font-display text-2xl font-semibold text-rose-dark">4</p>
          <p className="mt-1 text-xs text-stone">Comunidades activas</p>
        </div>
        <div className="flex-1 rounded-2xl bg-cream p-4 text-center">
          <p className="font-display text-2xl font-semibold text-rose-dark">12</p>
          <p className="mt-1 text-xs text-stone">Recursos subidos</p>
        </div>
        <div className="flex-1 rounded-2xl bg-cream p-4 text-center">
          <p className="font-display text-2xl font-semibold text-rose-dark">3</p>
          <p className="mt-1 text-xs text-stone">Sesiones de tutoría</p>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg text-ink">Mis Comunidades</h2>
          <Link to="/comunidades" className="text-sm font-medium text-rose-dark hover:underline">
            Ver todas →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {comunidadesMock.map((c) => (
            <div key={c.id} className="rounded-xl bg-rose-light p-3 text-center">
              <p className="text-sm font-medium text-ink">{c.nombre}</p>
              <span className="mt-2 inline-block rounded-full bg-mint px-2 py-0.5 text-xs text-olive">
                Comunidad activa
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg text-ink">Historial de sesiones</h2>
        <ul className="list-none p-0">
          {sesionesMock.map((s) => (
            <li
              key={s.id}
              className="mb-2 flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-olive text-xs font-semibold text-white">
                {s.nombre.charAt(0)}
              </div>
              <p className="flex-1 text-sm font-medium text-ink">{s.titulo}</p>
              <span className="text-xs text-faded">{s.fecha}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
