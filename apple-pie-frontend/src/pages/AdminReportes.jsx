import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { api } from '../api/axios.js'
import { getErrorMessage } from '../lib/apiError.js'

function AdminBottomNav() {
  const { pathname } = useLocation()
  const items = [
    { to: '/admin/dashboard', label: 'Inicio', icon: '🏠' },
    { to: '/admin/usuarios', label: 'Usuarias', icon: '👥' },
    { to: '/admin/pagos', label: 'Pagos y Planes', icon: '💲' },
    { to: '/perfil', label: 'Perfil', icon: '👤' },
  ]
  return (
    <nav
      className="mt-8 flex items-center justify-around gap-1 rounded-2xl border border-line bg-warm p-2 shadow-card"
      aria-label="Navegación administración"
    >
      {items.map(({ to, label, icon }) => {
        const active = pathname === to || (to === '/admin/dashboard' && pathname === '/admin')
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

function fmtDisplay(v) {
  if (v == null || v === '') return '—'
  if (typeof v === 'number' && !Number.isNaN(v)) {
    return Number.isInteger(v) ? String(v) : String(Math.round(v * 10) / 10)
  }
  return String(v)
}

function numOrNull(v) {
  const n = Number(v)
  return Number.isNaN(n) ? null : n
}

function cumpleMeta(valorRaw, metaRaw, explicit) {
  if (explicit === true || explicit === false) return explicit
  const v = numOrNull(valorRaw)
  const m = numOrNull(metaRaw)
  if (v == null || m == null) return false
  return v >= m
}

function kpiFromMetricasPayload(payload) {
  const m = payload?.metricas ?? payload?.data ?? payload
  if (!m || typeof m !== 'object') {
    return [
      { label: 'NPS mensual', valor: '—', meta: '—', cumplida: false },
      { label: 'Retención mensual', valor: '—', meta: '—', cumplida: false },
      { label: 'Grupos activos/mes', valor: '—', meta: '—', cumplida: false },
      { label: 'Resp. promedio foros', valor: '—', meta: '—', cumplida: false },
    ]
  }
  return [
    {
      label: 'NPS mensual',
      valor: fmtDisplay(m.nps_mensual ?? m.nps),
      meta: fmtDisplay(m.meta_nps ?? m.nps_meta ?? 50),
      cumplida: cumpleMeta(m.nps_mensual ?? m.nps, m.meta_nps ?? m.nps_meta, m.nps_cumple),
    },
    {
      label: 'Retención mensual',
      valor: fmtDisplay(m.retencion_mensual ?? m.retencion),
      meta: fmtDisplay(m.meta_retencion ?? m.retencion_meta ?? 80),
      cumplida: cumpleMeta(m.retencion_mensual ?? m.retencion, m.meta_retencion ?? m.retencion_meta, m.retencion_cumple),
    },
    {
      label: 'Grupos activos/mes',
      valor: fmtDisplay(m.grupos_activos_mes ?? m.grupos_mes),
      meta: fmtDisplay(m.meta_grupos ?? m.grupos_meta ?? 20),
      cumplida: cumpleMeta(m.grupos_activos_mes ?? m.grupos_mes, m.meta_grupos ?? m.grupos_meta, m.grupos_cumple),
    },
    {
      label: 'Resp. promedio foros',
      valor: fmtDisplay(m.resp_promedio_foros ?? m.tiempo_respuesta_foros),
      meta: fmtDisplay(m.meta_resp_foros ?? m.resp_foros_meta ?? 24),
      cumplida: cumpleMeta(m.resp_promedio_foros ?? m.tiempo_respuesta_foros, m.meta_resp_foros ?? m.resp_foros_meta, m.resp_foros_cumple),
    },
  ]
}

function modulosFromActividad(payload) {
  const d = payload?.modulos ?? payload?.actividad ?? payload?.data ?? payload
  if (!d || typeof d !== 'object') return []
  const defs = [
    { id: 'comunidades', label: 'Comunidades' },
    { id: 'repositorio', label: 'Repositorio' },
    { id: 'mentoria', label: 'Mentoría' },
    { id: 'perfil', label: 'Perfil' },
  ]
  const vals = defs.map(({ id }) => Number(d[id] ?? d[`${id}_pct`] ?? 0))
  const sum = vals.reduce((a, b) => a + b, 0)
  const max = vals.reduce((a, b) => Math.max(a, b), 0)
  if (sum === 0) return defs.map(({ id, label }) => ({ id, label, pct: 0 }))
  const looksLikePct = max <= 100 && Math.abs(sum - 100) <= 35
  return defs.map(({ id, label }, i) => ({
    id,
    label,
    pct: looksLikePct ? Math.min(100, Math.round(vals[i])) : Math.round((vals[i] / sum) * 100),
  }))
}

function rolesFromPayload(payload) {
  const u = payload?.roles ?? payload?.distribucion ?? payload?.usuarios ?? payload?.data ?? payload
  if (!u || typeof u !== 'object') {
    return { estudiantes: 0, mentoras: 0, moderadoras: 0 }
  }
  return {
    estudiantes: Number(u.estudiantes ?? u.estudiante ?? 0) || 0,
    mentoras: Number(u.mentoras ?? u.mentora ?? 0) || 0,
    moderadoras: Number(u.moderadoras ?? u.moderadora ?? 0) || 0,
  }
}

export default function AdminReportes() {
  const [loading, setLoading] = useState(true)
  const [kpi, setKpi] = useState(() => kpiFromMetricasPayload(null))
  const [modulos, setModulos] = useState([])
  const [roles, setRoles] = useState({ estudiantes: 0, mentoras: 0, moderadoras: 0 })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [metRes, actRes] = await Promise.all([
        api.get('/api/admin/reportes/metricas'),
        api.get('/api/admin/reportes/actividad'),
      ])
      setKpi(kpiFromMetricasPayload(metRes.data))
      setModulos(modulosFromActividad(actRes.data))

      let mergedRoles = rolesFromPayload(actRes.data)
      try {
        const usuRes = await api.get('/api/admin/reportes/usuarios')
        const fromUsu = rolesFromPayload(usuRes.data)
        if (fromUsu.estudiantes + fromUsu.mentoras + fromUsu.moderadoras > 0) mergedRoles = fromUsu
      } catch {
        /* mantener roles desde actividad */
      }
      setRoles(mergedRoles)
    } catch {
      setKpi(kpiFromMetricasPayload(null))
      setModulos([])
      setRoles({ estudiantes: 0, mentoras: 0, moderadoras: 0 })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const totalUsuarias = useMemo(
    () => roles.estudiantes + roles.mentoras + roles.moderadoras,
    [roles],
  )
  const objetivo = 100
  const progresoObjetivo = Math.min(100, Math.round((totalUsuarias / objetivo) * 100))

  function handleExport() {
    const base = (api.defaults.baseURL || '').replace(/\/$/, '')
    const url = `${base}/api/admin/reportes/export`
    try {
      const w = window.open(url, '_blank', 'noopener,noreferrer')
      if (!w) window.alert('No se pudo abrir la exportación. Revisa el bloqueador de ventanas.')
    } catch (e) {
      window.alert(getErrorMessage(e))
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 pb-10">
        <p className="rounded-2xl border border-line bg-warm p-8 text-center text-sm text-stone shadow-card">Cargando…</p>
        <AdminBottomNav />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <header className="rounded-2xl border border-line bg-warm p-6 shadow-card">
        <h1 className="font-display text-2xl text-ink">Reportes de actividad</h1>
        <p className="mt-2 text-sm text-stone">
          Métricas del sistema para seguimiento de objetivos y toma de decisiones.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpi.map((k) => (
          <div key={k.label} className="relative rounded-2xl border border-line bg-white p-5 shadow-card">
            {k.cumplida ? (
              <span
                className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-mint text-xs font-bold text-olive"
                title="Meta cumplida"
                aria-label="Meta cumplida"
              >
                ✓
              </span>
            ) : null}
            <p className="text-sm text-stone">{k.label}</p>
            <p className="mt-1 font-display text-2xl font-semibold text-ink">{k.valor}</p>
            <p className="mt-1 text-xs text-faded">
              Meta: <span className="font-medium text-stone">{k.meta}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <h2 className="font-display text-lg text-ink">Actividad por módulo</h2>
          <div className="mt-4 space-y-4">
            {modulos.length === 0 ? (
              <p className="text-sm text-stone">Sin datos de actividad.</p>
            ) : (
              modulos.map((m) => (
                <div key={m.id}>
                  <div className="flex justify-between text-xs text-stone">
                    <span>{m.label}</span>
                    <span>{m.pct}%</span>
                  </div>
                  <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-warm">
                    <div className="h-full rounded-full bg-olive transition-all" style={{ width: `${m.pct}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <h2 className="font-display text-lg text-ink">Distribución de roles</h2>
          <ul className="mt-4 list-none space-y-2 p-0 text-sm">
            <li className="flex justify-between border-b border-line py-2">
              <span className="text-stone">Estudiantes</span>
              <span className="font-semibold text-ink">{roles.estudiantes}</span>
            </li>
            <li className="flex justify-between border-b border-line py-2">
              <span className="text-stone">Mentoras</span>
              <span className="font-semibold text-ink">{roles.mentoras}</span>
            </li>
            <li className="flex justify-between py-2">
              <span className="text-stone">Moderadoras</span>
              <span className="font-semibold text-ink">{roles.moderadoras}</span>
            </li>
          </ul>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-stone">
              <span>Objetivo mes 1: 100 usuarias</span>
              <span>
                {totalUsuarias} / {objetivo}
              </span>
            </div>
            <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-warm">
              <div className="h-full rounded-full bg-rose transition-all" style={{ width: `${progresoObjetivo}%` }} />
            </div>
          </div>
        </section>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleExport}
          className="rounded-xl border border-rose bg-rose px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-dark"
        >
          Exportar datos →
        </button>
      </div>

      <AdminBottomNav />
    </div>
  )
}
