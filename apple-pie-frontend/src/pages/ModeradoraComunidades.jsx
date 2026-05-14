import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api/axios.js'

function normalizeComunidadesList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.comunidades)) return data.comunidades
  if (Array.isArray(data?.data)) return data.data
  return []
}

function mapGrupo(raw) {
  return {
    id: raw.id,
    nombre: raw.nombre ?? raw.name ?? '—',
    asignatura: raw.asignatura ?? raw.materia ?? '—',
    integrantes: raw.integrantes ?? raw.total_miembros ?? 0,
    publicaciones: raw.publicaciones ?? raw.posts ?? 0,
    reportes: Number(raw.reportes ?? 0),
    estado: raw.estado ?? '',
  }
}

function ModeradoraNav() {
  const { pathname } = useLocation()
  const items = [
    { to: '/moderadora/reportes', label: 'Reportes Activos', icon: '🛡️' },
    { to: '/moderadora/historial', label: 'Historial', icon: '〜' },
    { to: '/moderadora/comunidades', label: 'Comunidades', icon: '👥' },
  ]
  return (
    <nav
      className="mt-8 flex items-center justify-around gap-1 rounded-2xl border border-line bg-warm p-2 shadow-card"
      aria-label="Navegación moderadora"
    >
      {items.map(({ to, label, icon }) => {
        const active = pathname === to
        return (
          <Link
            key={to}
            to={to}
            className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-center text-xs font-medium transition-colors duration-200 ${
              active ? 'bg-olive text-white' : 'text-stone hover:bg-rose-light hover:text-ink'
            }`}
          >
            <span className="text-lg" aria-hidden="true">
              {icon}
            </span>
            <span className="leading-tight">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export default function ModeradoraComunidades() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [grupos, setGrupos] = useState([])
  const [q, setQ] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const { data } = await api.get('/api/moderacion/comunidades')
        if (!cancelled) setGrupos(normalizeComunidadesList(data).map(mapGrupo))
      } catch {
        if (!cancelled) setGrupos([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const filtrados = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return grupos
    return grupos.filter((g) => g.nombre.toLowerCase().includes(s))
  }, [grupos, q])

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 pb-10">
        <p className="rounded-2xl border border-line bg-warm p-8 text-center text-sm text-stone shadow-card">Cargando…</p>
        <ModeradoraNav />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <header className="rounded-2xl border border-line bg-warm p-6 shadow-card">
        <h1 className="font-display text-2xl text-ink">Supervisión de comunidades</h1>
        <p className="mt-2 text-sm text-stone">
          Monitorea la actividad de todos los grupos activos en la plataforma.
        </p>
      </header>

      <label htmlFor="mod-com-search" className="sr-only">
        Buscar grupo
      </label>
      <input
        id="mod-com-search"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por nombre de grupo…"
        className="w-full max-w-md rounded-full border border-line bg-white px-4 py-2.5 text-sm text-ink shadow-sm placeholder:text-faded focus:outline-none focus:ring-2 focus:ring-rose"
      />

      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-warm">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-olive">Grupo</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-olive">Asignatura</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-olive">Integrantes</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-olive">Publicaciones</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-olive">Reportes</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-olive">Estado</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-olive">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-stone">
                  No hay comunidades activas.
                </td>
              </tr>
            ) : (
              filtrados.map((g) => {
                const revisar = g.reportes > 0
                return (
                  <tr key={g.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-medium text-ink">{g.nombre}</td>
                    <td className="px-4 py-3 text-stone">{g.asignatura}</td>
                    <td className="px-4 py-3 text-ink">{g.integrantes}</td>
                    <td className="px-4 py-3 text-ink">{g.publicaciones}</td>
                    <td className="px-4 py-3 text-ink">{g.reportes}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          revisar ? 'bg-rose-light text-rose-dark' : 'bg-mint text-olive'
                        }`}
                      >
                        {revisar ? 'Revisar' : 'Normal'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/comunidades/${g.id}`)}
                        className="text-xs font-medium text-rose-dark hover:underline"
                      >
                        Ver grupo
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <ModeradoraNav />
    </div>
  )
}
