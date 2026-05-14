import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { api } from '../api/axios.js'
import { getErrorMessage } from '../lib/apiError.js'

function normalizeHistorialList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.historial)) return data.historial
  if (Array.isArray(data?.data)) return data.data
  return []
}

function mapFila(raw) {
  return {
    id: raw.id,
    fecha: raw.fecha ?? raw.created_at ?? '',
    reporte: raw.reporte ?? raw.titulo ?? raw.reporte_id ?? '—',
    accion_tomada: raw.accion_tomada ?? raw.accion ?? '—',
    moderadora: raw.moderadora ?? raw.moderadora_nombre ?? raw.moderador ?? '—',
    estado: raw.estado ?? 'Resuelto',
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

const FILTROS = [
  { value: 'todas', label: 'Todas las acciones' },
  { value: 'eliminaciones', label: 'Eliminaciones' },
  { value: 'suspensiones', label: 'Suspensiones' },
  { value: 'advertencias', label: 'Advertencias' },
  { value: 'desestimaciones', label: 'Desestimaciones' },
]

function matchesFiltro(row, filtro) {
  if (filtro === 'todas') return true
  const a = String(row.accion_tomada).toLowerCase()
  if (filtro === 'eliminaciones') return a.includes('elimin')
  if (filtro === 'suspensiones') return a.includes('suspens')
  if (filtro === 'advertencias') return a.includes('advert')
  if (filtro === 'desestimaciones') return a.includes('desestim')
  return true
}

export default function ModeradoraHistorial() {
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState([])
  const [filtro, setFiltro] = useState('todas')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const { data } = await api.get('/api/moderacion/historial')
        if (!cancelled) setRows(normalizeHistorialList(data).map(mapFila))
      } catch {
        if (!cancelled) setRows([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const filtradas = useMemo(() => rows.filter((r) => matchesFiltro(r, filtro)), [rows, filtro])

  function handleExportCsv() {
    const base = api.defaults.baseURL || ''
    const url = `${base.replace(/\/$/, '')}/api/moderacion/historial/export`
    try {
      const w = window.open(url, '_blank', 'noopener,noreferrer')
      if (!w) window.alert('No se pudo abrir la exportación. Revisa el bloqueador de ventanas.')
    } catch (e) {
      window.alert(getErrorMessage(e))
    }
  }

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
        <h1 className="font-display text-2xl text-ink">Historial de acciones</h1>
        <p className="mt-2 text-sm text-stone">Registro completo de moderación para auditoría.</p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label htmlFor="hist-filtro" className="sr-only">
          Filtrar acciones
        </label>
        <select
          id="hist-filtro"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full max-w-xs rounded-xl border border-rose bg-white px-3 py-2 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-rose sm:w-auto"
        >
          {FILTROS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleExportCsv}
          className="rounded-xl bg-olive px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-olive-deep"
        >
          Exportar CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-warm">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-olive">Fecha</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-olive">Reporte</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-olive">Acción tomada</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-olive">Moderadora</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-olive">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-stone">
                  No hay acciones registradas
                </td>
              </tr>
            ) : (
              filtradas.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-ink">{r.fecha}</td>
                  <td className="px-4 py-3 text-ink">{r.reporte}</td>
                  <td className="px-4 py-3 text-stone">{r.accion_tomada}</td>
                  <td className="px-4 py-3 text-stone">{r.moderadora}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-full bg-mint px-2 py-0.5 text-xs font-medium text-olive">
                      Resuelto
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ModeradoraNav />
    </div>
  )
}
