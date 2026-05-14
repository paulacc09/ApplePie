import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { api } from '../api/axios.js'
import { getErrorMessage } from '../lib/apiError.js'

function normalizeReportesList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.reportes)) return data.reportes
  if (Array.isArray(data?.data)) return data.data
  return []
}

function mapReporte(raw) {
  const u = String(raw.urgencia ?? raw.prioridad ?? 'pendiente').toLowerCase()
  return {
    id: raw.id,
    titulo: raw.titulo ?? raw.title ?? 'Sin título',
    descripcion: raw.descripcion ?? raw.description ?? '',
    reportado_por: raw.reportado_por ?? raw.reportante ?? '',
    tiempoLabel: raw.tiempo ?? raw.hace ?? '',
    created_at: raw.created_at,
    urgencia: u,
    tipo: String(raw.tipo ?? 'foro').toLowerCase(),
  }
}

function timeLabel(r) {
  if (typeof r.tiempoLabel === 'string' && r.tiempoLabel.trim()) return r.tiempoLabel
  const iso = r.created_at
  if (typeof iso === 'string' && iso.includes('T')) {
    const d = new Date(iso)
    if (!Number.isNaN(d.getTime())) {
      const h = Math.floor((Date.now() - d.getTime()) / 3600000)
      if (h < 1) return 'hace momentos'
      return `hace ${h}h`
    }
  }
  return '—'
}

function fmtStat(v) {
  if (v == null || v === '') return '—'
  return typeof v === 'number' ? String(v) : String(v)
}

const ACCIONES_FORO = [
  { label: 'Eliminar contenido', accion: 'eliminar_contenido' },
  { label: 'Emitir advertencia', accion: 'emitir_advertencia' },
  { label: 'Suspender cuenta', accion: 'suspender_cuenta' },
  { label: 'Desestimar', accion: 'desestimar' },
]

const ACCIONES_PERFIL = [
  { label: 'Revisar perfil', accion: 'revisar_perfil' },
  { label: 'Suspender cuenta', accion: 'suspender_cuenta' },
  { label: 'Desestimar', accion: 'desestimar' },
]

const ACCIONES_RECURSO = [
  { label: 'Bloquear recurso', accion: 'bloquear_recurso' },
  { label: 'Desestimar', accion: 'desestimar' },
]

function accionesPorTipo(tipo) {
  if (tipo === 'perfil') return ACCIONES_PERFIL
  if (tipo === 'recurso') return ACCIONES_RECURSO
  return ACCIONES_FORO
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

export default function ModeradoraReportes() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [reportes, setReportes] = useState([])

  const reloadData = useCallback(async (showLoading) => {
    if (showLoading) setLoading(true)
    try {
      const [statsRes, repRes] = await Promise.all([
        api.get('/api/moderacion/stats'),
        api.get('/api/moderacion/reportes?estado=activo'),
      ])
      const rawStats = statsRes.data?.stats ?? statsRes.data?.data ?? statsRes.data
      setStats(rawStats && typeof rawStats === 'object' ? rawStats : null)
      setReportes(normalizeReportesList(repRes.data).map(mapReporte))
    } catch {
      setStats(null)
      setReportes([])
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [])

  useEffect(() => {
    reloadData(true)
  }, [reloadData])

  const kpi = useMemo(() => {
    const s = stats ?? {}
    return [
      { label: 'Reportes pendientes', value: fmtStat(s.reportes_pendientes ?? s.pendientes ?? s.total_pendientes) },
      { label: 'Resueltos este mes', value: fmtStat(s.resueltos_mes ?? s.resueltos_este_mes) },
      { label: 'Tiempo prom. respuesta', value: fmtStat(s.tiempo_prom_respuesta ?? s.tiempo_prom ?? s.tiempo_promedio) },
      { label: 'Advertencias emitidas', value: fmtStat(s.advertencias_emitidas ?? s.advertencias) },
    ]
  }, [stats])

  const urgentes = useMemo(
    () =>
      reportes.filter((r) => {
        const u = String(r.urgencia).toLowerCase()
        return u === 'urgente' || u === 'urgencia' || u.includes('urgent')
      }).length,
    [reportes],
  )
  const pendientesCount = reportes.length

  async function ejecutarAccion(reporteId, accion) {
    try {
      await api.post(`/api/moderacion/reportes/${reporteId}/accion`, { accion })
      await reloadData(false)
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
        <h1 className="font-display text-2xl text-ink">Panel de moderación</h1>
        <p className="mt-2 text-sm text-stone">
          Gestiona el entorno seguro de Apple Pie. Reportes pendientes requieren atención en ≤24h.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpi.map((k) => (
          <div key={k.label} className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <p className="text-sm text-stone">{k.label}</p>
            <p className="mt-1 font-display text-3xl font-semibold text-ink">{k.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
          <h2 className="font-display text-lg text-ink">Reportes activos</h2>
          <span className="rounded-full bg-rose-light px-3 py-1 text-xs font-medium text-rose-dark">
            {urgentes} urgentes / {pendientesCount} pendientes
          </span>
        </div>

        {reportes.length === 0 ? (
          <p className="rounded-xl border border-line bg-warm py-8 text-center text-sm text-stone">No hay reportes activos</p>
        ) : (
          <ul className="list-none space-y-4 p-0">
            {reportes.map((r) => {
              const urg = r.urgencia === 'urgente' || r.urgencia === 'urgencia' || String(r.urgencia).toLowerCase().includes('urgent')
              return (
                <li key={String(r.id)} className="rounded-2xl border border-line bg-warm p-4 shadow-card">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-display text-base font-semibold text-ink">{r.titulo}</h3>
                    <span className="shrink-0 text-xs text-faded">{timeLabel(r)}</span>
                  </div>
                  <p className="mt-2 text-sm text-stone">{r.descripcion}</p>
                  {r.reportado_por ? (
                    <p className="mt-1 text-xs text-faded">Reportado por: {r.reportado_por}</p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        urg ? 'bg-rose text-white' : 'bg-blush text-rose-dark'
                      }`}
                    >
                      {urg ? 'URGENTE' : 'PENDIENTE'}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {accionesPorTipo(r.tipo).map(({ label, accion }) => (
                      <button
                        key={accion}
                        type="button"
                        onClick={() => ejecutarAccion(r.id, accion)}
                        className="rounded-xl border border-rose bg-white px-3 py-1.5 text-xs font-medium text-rose-dark transition-colors hover:bg-rose-light"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <ModeradoraNav />
    </div>
  )
}
