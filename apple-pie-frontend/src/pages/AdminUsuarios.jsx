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

function normalizeUsuariosList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.usuarios)) return data.usuarios
  if (Array.isArray(data?.data)) return data.data
  return []
}

function mapUsuario(raw) {
  const rolRaw = String(raw.rol ?? raw.role ?? 'estudiante').toLowerCase()
  const estadoRaw = String(raw.estado ?? raw.status ?? 'activa').toLowerCase()
  return {
    id: raw.id,
    nombre: raw.nombre ?? raw.name ?? '—',
    email: raw.email ?? '—',
    rol: rolRaw,
    plan: String(raw.plan ?? raw.subscription ?? 'gratuito').toLowerCase(),
    registro: raw.registro ?? raw.fecha_registro ?? raw.created_at ?? '—',
    estado: estadoRaw === 'suspendida' || estadoRaw === 'suspended' ? 'suspendida' : 'activa',
  }
}

function inicialNombre(nombre) {
  const t = String(nombre).trim()
  if (!t) return '?'
  return t.slice(0, 1).toUpperCase()
}

function badgeRolClass(rol) {
  if (rol === 'mentora') return 'bg-rose text-white'
  if (rol === 'moderadora') return 'bg-olive text-white'
  return 'bg-faded text-ink'
}

function labelRol(rol) {
  if (rol === 'mentora') return 'Mentora'
  if (rol === 'moderadora') return 'Moderadora'
  return 'Estudiante'
}

function badgePlanClass(plan) {
  if (plan === 'premium') return 'bg-rose-light text-rose-dark'
  return 'border border-line text-stone'
}

function labelPlan(plan) {
  return plan === 'premium' ? 'Premium' : 'Gratuito'
}

export default function AdminUsuarios() {
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  const [rolFiltro, setRolFiltro] = useState('todos')
  const [estadoFiltro, setEstadoFiltro] = useState('todos')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/admin/usuarios')
      setRows(normalizeUsuariosList(res.data).map(mapUsuario))
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtradas = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return rows.filter((u) => {
      if (needle) {
        const n = String(u.nombre).toLowerCase()
        const e = String(u.email).toLowerCase()
        if (!n.includes(needle) && !e.includes(needle)) return false
      }
      if (rolFiltro !== 'todos' && u.rol !== rolFiltro) return false
      if (estadoFiltro !== 'todos' && u.estado !== estadoFiltro) return false
      return true
    })
  }, [rows, q, rolFiltro, estadoFiltro])

  async function patchEstado(id, estado) {
    try {
      await api.patch(`/api/admin/usuarios/${id}`, { estado })
      await load()
    } catch (e) {
      window.alert(getErrorMessage(e))
    }
  }

  async function eliminar(id) {
    if (!window.confirm('¿Eliminar definitivamente esta cuenta?')) return
    try {
      await api.delete(`/api/admin/usuarios/${id}`)
      await load()
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
        <h1 className="font-display text-2xl text-ink">Gestión de usuarios</h1>
        <p className="mt-2 text-sm text-stone">
          Crea, modifica y desactiva cuentas. Asigna roles con permisos específicos.
        </p>
      </header>

      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 shadow-card md:flex-row md:flex-wrap md:items-end">
        <label className="block min-w-[12rem] flex-1 text-xs font-medium text-stone">
          Buscar
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nombre o email"
            className="mt-1 w-full rounded-xl border border-line bg-warm px-3 py-2 text-sm text-ink outline-none ring-rose/30 focus:ring-2"
          />
        </label>
        <label className="block min-w-[10rem] text-xs font-medium text-stone">
          Rol
          <select
            value={rolFiltro}
            onChange={(e) => setRolFiltro(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-warm px-3 py-2 text-sm text-ink outline-none ring-rose/30 focus:ring-2"
          >
            <option value="todos">Todos los roles</option>
            <option value="mentora">Mentora</option>
            <option value="moderadora">Moderadora</option>
            <option value="estudiante">Estudiante</option>
          </select>
        </label>
        <label className="block min-w-[10rem] text-xs font-medium text-stone">
          Estado
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-warm px-3 py-2 text-sm text-ink outline-none ring-rose/30 focus:ring-2"
          >
            <option value="todos">Todos los estados</option>
            <option value="activa">Activa</option>
            <option value="suspendida">Suspendida</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => window.alert('Próximamente: formulario de alta de usuaria.')}
          className="rounded-xl border border-rose bg-rose px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-dark"
        >
          + Nueva usuaria
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-warm text-xs uppercase tracking-wide text-stone">
              <th className="px-4 py-3 font-medium">Usuaria</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Registro</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-stone">
                  No hay usuarias que coincidan.
                </td>
              </tr>
            ) : (
              filtradas.map((u) => (
                <tr key={u.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-light font-display text-sm font-semibold text-rose-dark">
                        {inicialNombre(u.nombre)}
                      </span>
                      <span className="font-medium text-ink">{u.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeRolClass(u.rol)}`}>
                      {labelRol(u.rol)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${badgePlanClass(u.plan)}`}>
                      {labelPlan(u.plan)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone">{u.registro}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.estado === 'activa' ? 'bg-mint text-olive' : 'bg-blush text-rose-dark'
                      }`}
                    >
                      {u.estado === 'activa' ? 'Activa' : 'Suspendida'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => window.alert('Próximamente: edición de usuaria.')}
                        className="rounded-lg border border-rose px-2 py-1 text-xs font-medium text-rose-dark hover:bg-rose-light"
                      >
                        Editar
                      </button>
                      {u.estado === 'activa' ? (
                        <button
                          type="button"
                          onClick={() => patchEstado(u.id, 'suspendida')}
                          className="rounded-lg border border-line px-2 py-1 text-xs font-medium text-stone hover:bg-warm"
                        >
                          Suspender
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => patchEstado(u.id, 'activa')}
                          className="rounded-lg border border-line px-2 py-1 text-xs font-medium text-stone hover:bg-warm"
                        >
                          Reactivar
                        </button>
                      )}
                      {u.estado === 'suspendida' ? (
                        <button
                          type="button"
                          onClick={() => eliminar(u.id)}
                          className="rounded-lg border border-rose bg-blush px-2 py-1 text-xs font-medium text-rose-dark hover:opacity-90"
                        >
                          Eliminar
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AdminBottomNav />
    </div>
  )
}
