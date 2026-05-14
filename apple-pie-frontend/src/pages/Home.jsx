import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const mockComunidades = [
  { nombre: 'Cálculo en equipo', materia: 'Cálculo III', emoji: '📐' },
  { nombre: 'Estructuras Study', materia: 'Estructuras de datos', emoji: '💻' },
  { nombre: 'Física moderna', materia: 'Física', emoji: '🔬' },
]

const mockRecursos = [
  { nombre: 'Resumen integrales.pdf', autor: 'María G.', fecha: 'Hace 2 días' },
  { nombre: 'Árboles binarios — guía.pdf', autor: 'Ana R.', fecha: 'Hace 5 días' },
  { nombre: 'Ondas y partículas.pdf', autor: 'Lucía P.', fecha: 'Hace 1 semana' },
]

export default function Home() {
  const { user } = useAuth()
  const nombre = user?.nombre ?? user?.name ?? 'estudiante'

  return (
    <div className="mx-auto max-w-3xl space-y-8 md:max-w-5xl">
      <div className="md:hidden">
        <label htmlFor="home-search" className="sr-only">
          Buscar
        </label>
        <input
          id="home-search"
          type="search"
          placeholder="Buscar comunidades, recursos..."
          className="w-full rounded-full border border-line bg-warm px-4 py-2.5 text-sm text-ink shadow-card placeholder:text-faded"
        />
      </div>

      <header>
        <h1 className="font-display text-2xl text-ink md:text-3xl">
          Hola, {nombre} 👋
        </h1>
        <p className="mt-1 text-sm text-stone">¿Qué quieres aprender hoy?</p>
      </header>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg text-ink">Mis Comunidades</h2>
          <Link to="/comunidades" className="text-sm font-medium text-rose-dark hover:underline">
            Ver todas →
          </Link>
        </div>
        <div className="-mx-4 flex gap-3 overflow-x-auto pb-2 px-4 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
          {mockComunidades.map((c) => (
            <article
              key={c.nombre}
              className="min-w-[160px] shrink-0 rounded-2xl bg-rose-light p-4 shadow-card"
            >
              <div className="text-2xl" aria-hidden="true">
                {c.emoji}
              </div>
              <p className="mt-2 text-sm font-medium text-ink">{c.nombre}</p>
              <p className="text-xs text-stone">{c.materia}</p>
            </article>
          ))}
          <button
            type="button"
            className="flex min-w-[160px] shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-rose bg-warm p-4 text-center shadow-card"
          >
            <span className="text-2xl text-rose" aria-hidden="true">
              +
            </span>
            <span className="mt-2 text-sm text-rose-dark">Crear comunidad</span>
          </button>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg text-ink">Recursos Recientes</h2>
        <ul className="space-y-2">
          {mockRecursos.map((r) => (
            <li
              key={r.nombre}
              className="flex items-center gap-3 rounded-xl bg-warm p-3 shadow-card"
            >
              <span className="rounded-lg bg-blush px-2 py-2 text-xs font-bold text-rose-dark">PDF</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{r.nombre}</p>
                <p className="text-xs text-faded">
                  Subido por {r.autor} · {r.fecha}
                </p>
              </div>
              <button type="button" className="text-xs font-medium text-rose-dark hover:underline">
                Descargar
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
