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

function fmtStat(v) {
  if (v == null || v === '') return '—'
  return typeof v === 'number' ? String(v) : String(v)
}

function fmtMoney(v) {
  if (v == null || v === '') return '—'
  const n = Number(v)
  if (Number.isNaN(n)) return String(v)
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)
}

function normalizeArray(data, keys) {
  if (Array.isArray(data)) return data
  for (const k of keys) {
    if (Array.isArray(data?.[k])) return data[k]
  }
  return []
}

function inicialNombre(nombre) {
  const t = String(nombre).trim()
  if (!t) return '?'
  return t.slice(0, 1).toUpperCase()
}

function monthKeyFromFecha(fecha) {
  if (typeof fecha !== 'string') return ''
  const m = fecha.match(/^(\d{4})-(\d{2})/)
  return m ? `${m[1]}-${m[2]}` : ''
}

function mapHistorialRow(raw) {
  return {
    id: raw.id,
    fecha: raw.fecha ?? raw.created_at ?? '—',
    concepto: raw.concepto ?? raw.descripcion ?? '—',
    usuaria: raw.usuaria ?? raw.usuario ?? raw.user ?? '—',
    metodo: raw.metodo ?? raw.payment_method ?? '—',
    monto: raw.monto ?? raw.amount ?? 0,
    tipo: String(raw.tipo ?? 'otro').toLowerCase(),
    estado: String(raw.estado ?? raw.status ?? '—'),
  }
}

function mapPendiente(raw) {
  return {
    id: raw.id,
    nombre: raw.nombre ?? raw.mentora ?? raw.mentora_nombre ?? '—',
    detalle: raw.detalle ?? raw.concepto ?? '',
    monto: raw.monto ?? raw.amount ?? 0,
  }
}

function tipoBadgeClass(tipo) {
  if (tipo === 'suscripcion' || tipo === 'premium') return 'bg-rose-light text-rose-dark'
  if (tipo === 'payout' || tipo === 'mentora') return 'bg-mint text-olive'
  return 'bg-faded text-ink'
}

export default function AdminPagos() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [planes, setPlanes] = useState([])
  const [transacciones, setTransacciones] = useState([])
  const [pendientes, setPendientes] = useState([])
  const [historial, setHistorial] = useState([])
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroMes, setFiltroMes] = useState('todos')

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [s, p, t, pen, h] = await Promise.all([
        api.get('/api/admin/pagos/stats'),
        api.get('/api/admin/planes'),
        api.get('/api/admin/pagos/transacciones?limit=5'),
        api.get('/api/admin/pagos/pendientes'),
        api.get('/api/admin/pagos/historial'),
      ])
      const sd = s.data?.stats ?? s.data?.data ?? s.data
      setStats(sd && typeof sd === 'object' ? sd : null)
      setPlanes(normalizeArray(p.data, ['planes', 'data']))
      setTransacciones(normalizeArray(t.data, ['transacciones', 'data']))
      setPendientes(normalizeArray(pen.data, ['pendientes', 'data']).map(mapPendiente))
      setHistorial(normalizeArray(h.data, ['historial', 'data']).map(mapHistorialRow))
    } catch {
      setStats(null)
      setPlanes([])
      setTransacciones([])
      setPendientes([])
      setHistorial([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const kpi = useMemo(() => {
    const x = stats ?? {}
    return [
      { label: 'Ingresos este mes', value: fmtMoney(x.ingresos_mes ?? x.ingresos) },
      { label: 'Suscripciones activas', value: fmtStat(x.suscripciones_activas ?? x.suscripciones) },
      { label: 'Pagos a mentoras', value: fmtMoney(x.pagos_mentoras ?? x.total_pagos_mentoras) },
      { label: 'Pagos pendientes', value: fmtStat(x.pagos_pendientes ?? x.pendientes) },
    ]
  }, [stats])

  const ingresosPorPlan = useMemo(() => {
    const list = planes.map((pl) => {
      const nombre = pl.nombre ?? pl.name ?? 'Plan'
      const monto = Number(pl.ingresos ?? pl.monto_ingresos ?? pl.total ?? 0) || 0
      const usuarias = pl.usuarias ?? pl.usuarios ?? pl.count ?? 0
      return { nombre, monto, usuarias: Number(usuarias) || 0, popular: !!pl.popular }
    })
    const max = list.reduce((a, b) => Math.max(a, b.monto), 0) || 1
    return list.map((row) => ({ ...row, pct: max > 0 ? Math.round((row.monto / max) * 100) : 0 }))
  }, [planes])

  const mesesHistorial = useMemo(() => {
    const set = new Set()
    historial.forEach((r) => {
      const k = monthKeyFromFecha(r.fecha)
      if (k) set.add(k)
    })
    return Array.from(set).sort().reverse()
  }, [historial])

  const historialFiltrado = useMemo(() => {
    return historial.filter((r) => {
      if (filtroTipo !== 'todos' && r.tipo !== filtroTipo) return false
      if (filtroMes !== 'todos' && monthKeyFromFecha(r.fecha) !== filtroMes) return false
      return true
    })
  }, [historial, filtroTipo, filtroMes])

  async function aprobarPago(id) {
    try {
      await api.post(`/api/admin/pagos/${id}/aprobar`)
      await loadAll()
    } catch (e) {
      window.alert(getErrorMessage(e))
    }
  }

  async function aprobarTodos() {
    if (!pendientes.length) return
    if (!window.confirm(`¿Aprobar ${pendientes.length} pago(s) pendiente(s)?`)) return
    try {
      await Promise.allSettled(pendientes.map((p) => api.post(`/api/admin/pagos/${p.id}/aprobar`)))
      await loadAll()
    } catch (e) {
      window.alert(getErrorMessage(e))
    }
  }

  function exportarCsv() {
    const cols = ['fecha', 'concepto', 'usuaria', 'metodo', 'monto', 'tipo', 'estado']
    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`
    const lines = [cols.join(',')]
    historialFiltrado.forEach((r) => {
      lines.push([r.fecha, r.concepto, r.usuaria, r.metodo, r.monto, r.tipo, r.estado].map(esc).join(','))
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'historial-pagos.csv'
    a.click()
    URL.revokeObjectURL(url)
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
        <h1 className="font-display text-2xl text-ink">Gestión de pagos y planes</h1>
        <p className="mt-2 text-sm text-stone">
          Supervisa ingresos, planes de suscripción y pagos a mentoras.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpi.map((k) => (
          <div key={k.label} className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <p className="text-sm text-stone">{k.label}</p>
            <p className="mt-1 font-display text-2xl font-semibold text-ink">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <h2 className="font-display text-lg text-ink">Planes de suscripción</h2>
          <ul className="mt-4 list-none space-y-3 p-0">
            {planes.length === 0 ? (
              <li className="text-sm text-stone">No hay planes configurados.</li>
            ) : (
              planes.map((pl, i) => {
                const nombre = pl.nombre ?? pl.name ?? `Plan ${i + 1}`
                const precio = pl.precio ?? pl.price ?? pl.monto_mensual
                const nUsers = pl.usuarias ?? pl.usuarios ?? pl.count ?? '—'
                return (
                  <li
                    key={pl.id ?? nombre}
                    className="flex flex-col gap-2 rounded-xl border border-line bg-warm p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-ink">{nombre}</p>
                      <p className="text-sm text-stone">
                        Precio: {precio != null ? fmtMoney(precio) : '—'} · N° usuarias: {nUsers}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => window.alert('Próximamente: edición de plan.')}
                        className="rounded-lg border border-rose px-3 py-1.5 text-xs font-medium text-rose-dark hover:bg-rose-light"
                      >
                        Editar
                      </button>
                      {pl.popular === true ? (
                        <button
                          type="button"
                          onClick={() => window.alert('Este plan está marcado como el más popular.')}
                          className="rounded-lg border border-olive bg-mint px-3 py-1.5 text-xs font-medium text-olive hover:opacity-90"
                        >
                          Más popular
                        </button>
                      ) : null}
                    </div>
                  </li>
                )
              })
            )}
          </ul>
        </section>

        <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <h2 className="font-display text-lg text-ink">Ingresos por plan</h2>
          <div className="mt-4 space-y-3">
            {ingresosPorPlan.length === 0 ? (
              <p className="text-sm text-stone">Sin datos de ingresos por plan.</p>
            ) : (
              ingresosPorPlan.map((row) => (
                <div key={row.nombre}>
                  <div className="flex justify-between text-xs text-stone">
                    <span>{row.nombre}</span>
                    <span>{fmtMoney(row.monto)}</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-warm">
                    <div className="h-full rounded-full bg-rose transition-all" style={{ width: `${row.pct}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
          <h3 className="mt-6 font-display text-base text-ink">Últimas transacciones</h3>
          <ul className="mt-2 list-none space-y-2 p-0 text-sm">
            {transacciones.length === 0 ? (
              <li className="text-stone">Sin transacciones recientes.</li>
            ) : (
              transacciones.map((tx, idx) => (
                <li key={tx.id ?? idx} className="flex justify-between gap-2 border-b border-line pb-2 last:border-0">
                  <span className="text-ink">{tx.concepto ?? tx.descripcion ?? 'Movimiento'}</span>
                  <span className="shrink-0 font-medium text-olive">{fmtMoney(tx.monto ?? tx.amount)}</span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-lg text-ink">Pagos pendientes a mentoras</h2>
          <button
            type="button"
            onClick={aprobarTodos}
            disabled={!pendientes.length}
            className="rounded-xl border border-rose bg-rose px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            Aprobar todos
          </button>
        </div>
        <ul className="mt-4 list-none space-y-3 p-0">
          {pendientes.length === 0 ? (
            <li className="text-sm text-stone">No hay pagos pendientes.</li>
          ) : (
            pendientes.map((p) => (
              <li
                key={p.id}
                className="flex flex-col gap-3 rounded-xl border border-line bg-warm p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-light font-display text-sm font-semibold text-rose-dark">
                    {inicialNombre(p.nombre)}
                  </span>
                  <div>
                    <p className="font-medium text-ink">{p.nombre}</p>
                    <p className="text-sm text-stone">{p.detalle || 'Pago pendiente'}</p>
                    <p className="mt-1 text-sm font-semibold text-olive">{fmtMoney(p.monto)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => aprobarPago(p.id)}
                    className="rounded-lg border border-rose bg-white px-3 py-1.5 text-xs font-medium text-rose-dark hover:bg-rose-light"
                  >
                    Aprobar
                  </button>
                  <button
                    type="button"
                    onClick={() => window.alert(`Detalle del pago #${p.id}`)}
                    className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-stone hover:bg-white"
                  >
                    Ver detalle
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h2 className="font-display text-lg text-ink">Historial completo</h2>
          <div className="flex flex-wrap gap-2">
            <label className="text-xs font-medium text-stone">
              Tipo
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="mt-1 block rounded-xl border border-line bg-warm px-3 py-2 text-sm text-ink outline-none ring-rose/30 focus:ring-2"
              >
                <option value="todos">Todos</option>
                <option value="suscripcion">Suscripción</option>
                <option value="premium">Premium</option>
                <option value="payout">Payout</option>
                <option value="mentora">Mentora</option>
                <option value="otro">Otro</option>
              </select>
            </label>
            <label className="text-xs font-medium text-stone">
              Mes
              <select
                value={filtroMes}
                onChange={(e) => setFiltroMes(e.target.value)}
                className="mt-1 block rounded-xl border border-line bg-warm px-3 py-2 text-sm text-ink outline-none ring-rose/30 focus:ring-2"
              >
                <option value="todos">Todos</option>
                {mesesHistorial.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={exportarCsv}
              className="rounded-xl border border-rose bg-warm px-4 py-2 text-sm font-medium text-rose-dark hover:bg-rose-light md:self-end"
            >
              Exportar CSV
            </button>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-warm text-xs uppercase tracking-wide text-stone">
                <th className="px-3 py-2 font-medium">Fecha</th>
                <th className="px-3 py-2 font-medium">Concepto</th>
                <th className="px-3 py-2 font-medium">Usuaria</th>
                <th className="px-3 py-2 font-medium">Método</th>
                <th className="px-3 py-2 font-medium">Monto</th>
                <th className="px-3 py-2 font-medium">Tipo</th>
                <th className="px-3 py-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {historialFiltrado.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-stone">
                    Sin registros con los filtros actuales.
                  </td>
                </tr>
              ) : (
                historialFiltrado.map((r) => (
                  <tr key={r.id ?? `${r.fecha}-${r.concepto}`} className="border-b border-line last:border-0">
                    <td className="px-3 py-2 text-stone">{r.fecha}</td>
                    <td className="px-3 py-2 text-ink">{r.concepto}</td>
                    <td className="px-3 py-2">{r.usuaria}</td>
                    <td className="px-3 py-2 text-stone">{r.metodo}</td>
                    <td className="px-3 py-2 font-medium">{fmtMoney(r.monto)}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tipoBadgeClass(r.tipo)}`}>
                        {r.tipo}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-stone">{r.estado}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AdminBottomNav />
    </div>
  )
}
