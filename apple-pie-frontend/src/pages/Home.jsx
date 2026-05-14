import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function StatCard({ emoji, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900">
      <span className="text-2xl" aria-hidden="true">
        {emoji}
      </span>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-semibold text-[#6C63FF] dark:text-[#a8a3ff]">{value}</p>
      </div>
    </div>
  )
}

const mockComunidades = [
  { nombre: 'Cálculo en equipo', materia: 'Cálculo III', integrantes: 24 },
  { nombre: 'Estructuras Study', materia: 'Estructuras de datos', integrantes: 18 },
  { nombre: 'Física moderna', materia: 'Física', integrantes: 12 },
]

const mockRecursos = ['Resumen integrales.pdf', 'Árboles binarios — guía.pdf', 'Ondas y partículas.pdf']

export default function Home() {
  const { user } = useAuth()
  const nombre = user?.nombre ?? user?.name ?? 'estudiante'

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <header>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white md:text-4xl">
          Hola, {nombre} 👋
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">¿Qué quieres aprender hoy?</p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard emoji="📚" label="Mis comunidades" value={3} />
        <StatCard emoji="📄" label="Recursos guardados" value={12} />
        <StatCard emoji="🎓" label="Mentorías pendientes" value={1} />
      </div>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mis comunidades recientes</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {mockComunidades.map((c) => (
            <article
              key={c.nombre}
              className="rounded-2xl border border-[#F9C5D1] bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <p className="font-semibold text-gray-900 dark:text-white">{c.nombre}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{c.materia}</p>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">👥 {c.integrantes} integrantes</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recursos recientes</h2>
        <ul className="mt-4 space-y-3">
          {mockRecursos.map((r) => (
            <li
              key={r}
              className="flex flex-col justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-900 sm:flex-row sm:items-center"
            >
              <span className="font-medium text-gray-800 dark:text-gray-100">{r}</span>
              <button
                type="button"
                className="rounded-xl bg-[#6C63FF] px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-[#5855d6]"
              >
                Ver
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex justify-center pb-8">
        <Link
          to="/comunidades"
          className="rounded-2xl bg-[#F9C5D1] px-8 py-3 font-semibold text-[#6C63FF] shadow-md transition-all duration-200 hover:shadow-lg dark:bg-gray-800 dark:text-[#a8a3ff]"
        >
          Explorar comunidades
        </Link>
      </div>
    </div>
  )
}
