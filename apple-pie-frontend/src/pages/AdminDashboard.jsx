import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api/axios.js'
import { getErrorMessage } from '../lib/apiError.js'

function fmtStat(v) {
  if (v == null || v === '') return '—'
  return typeof v === 'number' ? String(v) : String(v)
}

function normalizeLogList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.log)) return data.log
  if (Array.isArray(data?.data)) return data.data
  return []
}

function mapLogItem(raw) {
  const nivel = String(raw.nivel ?? raw.tipo ?? raw.severidad ?? 'info').toLowerCase()
  return {
    id: raw.id ?? `${raw.hora}-${raw.texto}`,
    critico: nivel === 'critico' || nivel === 'critical' || nivel === 'error',
    hora: raw.hora ?? raw.timestamp ?? raw.created_at ?? '—',
    texto: raw.texto ?? raw.mensaje ?? raw.message ?? '',
  }
}

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

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [logItems, setLogItems] = useState([])

  const loadData = useCallback(async (showLoading) => {
    if (showLoading) setLoading(true)
    try {
      const [statsRes, logRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/log'),
      ])
      const rawStats = statsRes.data?.stats ?? statsRes.data?.data ?? statsRes.data
      setStats(rawStats && typeof rawStats === 'object' ? rawStats : null)
      setLogItems(normalizeLogList(logRes.data).map(mapLogItem))
    } catch {
      setStats(null)
      setLogItems([])
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData(true)
  }, [loadData])

  const kpi = useMemo(() => {
    const s = stats ?? {}
    return [
      { label: 'Usuarias activas', value: fmtStat(s.usuarias_activas ?? s.usuarios_activos ?? s.activas) },
      { label: 'Grupos activos', value: fmtStat(s.grupos_activos ?? s.comunidades_activas) },
      { label: 'Ingresos del mes', value: fmtStat(s.ingresos_mes ?? s.ingresos) },
      { label: 'Disponibilidad', value: fmtStat(s.disponibilidad ?? s.uptime) },
    ]
  }, [stats])

  async function handleBackup() {
    try {
      await api.post('/api/admin/backup')
      window.alert('Respaldo solicitado correctamente.')
    } catch (e) {
      window.alert(getErrorMessage(e))
    }
  }

  async function handleAnuncio() {
    const texto = window.prompt('Texto del anuncio global:')
    if (texto == null) return
    try {
      await api.post('/api/admin/anuncio', { texto })
      window.alert('Anuncio enviado.')
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
        <h1 className="font-display text-2xl text-ink">Panel de administración</h1>
        <p className="mt-2 text-sm text-stone">
          Vista centralizada del sistema. Todas las acciones quedan registradas para auditoría.
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

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <h2 className="font-display text-lg text-ink">Acciones rápidas</h2>
          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => navigate('/admin/usuarios')}
              className="w-full rounded-xl border border-rose bg-warm px-4 py-3 text-left text-sm font-medium text-rose-dark transition-colors hover:bg-rose-light"
            >
              Gestionar usuarios y roles
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/pagos')}
              className="w-full rounded-xl border border-rose bg-warm px-4 py-3 text-left text-sm font-medium text-rose-dark transition-colors hover:bg-rose-light"
            >
              Gestión de pagos y planes
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/reportes')}
              className="w-full rounded-xl border border-rose bg-warm px-4 py-3 text-left text-sm font-medium text-rose-dark transition-colors hover:bg-rose-light"
            >
              Ver reportes de actividad
            </button>
            <button
              type="button"
              onClick={handleBackup}
              className="w-full rounded-xl border border-rose bg-warm px-4 py-3 text-left text-sm font-medium text-rose-dark transition-colors hover:bg-rose-light"
            >
              Crear respaldo del sistema
            </button>
            <button
              type="button"
              onClick={handleAnuncio}
              className="w-full rounded-xl border border-rose bg-warm px-4 py-3 text-left text-sm font-medium text-rose-dark transition-colors hover:bg-rose-light"
            >
              Enviar anuncio global
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <h2 className="font-display text-lg text-ink">Log del sistema</h2>
          <ul className="mt-4 list-none space-y-3 p-0">
            {logItems.length === 0 ? (
              <li className="text-sm text-stone">Sin eventos recientes.</li>
            ) : (
              logItems.map((item) => (
                <li key={String(item.id)} className="flex gap-3 text-sm">
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.critico ? 'bg-rose' : 'bg-olive'}`}
                    aria-hidden="true"
                  />
                  <div>
                    <span className="text-xs text-faded">{item.hora}</span>
                    <p className="text-ink">{item.texto}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      <AdminBottomNav />
    </div>
  )
}
