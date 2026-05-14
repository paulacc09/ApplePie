import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/axios.js'
import { getErrorMessage } from '../lib/apiError.js'

function formatRelativo(fechaStr) {
  if (!fechaStr) return 'Fecha desconocida'
  const diff = Date.now() - new Date(fechaStr).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'Hace menos de 1 h'
  if (h < 24) return `Hace ${h} h`
  const d = Math.floor(h / 24)
  if (d === 1) return 'Ayer'
  return `Hace ${d} días`
}

function normalizeMentorasList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.mentoras)) return data.mentoras
  if (Array.isArray(data?.data)) return data.data
  return []
}

function normalizeSesionesList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.sesiones)) return data.sesiones
  if (Array.isArray(data?.data)) return data.data
  return []
}

function mapSesionPendiente(s) {
  return {
    id: s.id,
    nombre: `Estudiante #${s.estudiante_id}`,
    detalle: `${s.asignatura ?? 'Sin asignatura'} — ${
      s.fecha_hora
        ? new Date(s.fecha_hora).toLocaleString('es-CO', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Fecha por confirmar'
    }`,
    estado: s.estado === 'pendiente' ? 'Pendiente' : 'Confirmada',
  }
}

export default function DashboardMentora() {
  const { user } = useAuth()
  const nombre = user?.nombre ?? user?.name ?? 'Mentora'
  const userId = user?.id ?? user?._id

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [todasLasSesiones, setTodasLasSesiones] = useState([])
  const [sesionesPendienteQuery, setSesionesPendienteQuery] = useState([])
  const [mentorasList, setMentorasList] = useState([])

  const cargarDatos = useCallback(async () => {
    setCargando(true)
    setError(null)

    const [r1, r2, r3] = await Promise.allSettled([
      api.get('/api/sesiones/mentora'),
      api.get('/api/sesiones/mentora?estado=pendiente'),
      api.get('/api/mentoras'),
    ])

    const errores = []
    let todas = []
    let pendFilter = []
    let mentoras = []

    if (r1.status === 'fulfilled') {
      todas = normalizeSesionesList(r1.value.data)
    } else {
      errores.push(getErrorMessage(r1.reason))
    }

    if (r2.status === 'fulfilled') {
      pendFilter = normalizeSesionesList(r2.value.data)
    } else {
      errores.push(getErrorMessage(r2.reason))
    }

    if (r3.status === 'fulfilled') {
      mentoras = normalizeMentorasList(r3.value.data)
    } else {
      errores.push(getErrorMessage(r3.reason))
    }

    setTodasLasSesiones(todas)
    setSesionesPendienteQuery(pendFilter)
    setMentorasList(mentoras)
    setError(errores.length ? errores.join(' · ') : null)
    setCargando(false)
  }, [])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  const perfilMentora = useMemo(() => {
    if (userId == null) return null
    return mentorasList.find((m) => Number(m.usuario_id) === Number(userId)) ?? null
  }, [mentorasList, userId])

  const kpi = useMemo(() => {
    const estudiantesUnicas = new Set(todasLasSesiones.map((s) => s.estudiante_id).filter(Boolean)).size
    const calStr =
      perfilMentora?.calificacion != null && perfilMentora.calificacion !== ''
        ? String(perfilMentora.calificacion)
        : '—'
    return [
      {
        label: 'Sesiones totales',
        value: String(todasLasSesiones.length),
        sub: 'Todas tus sesiones',
        color: 'text-rose-dark',
      },
      {
        label: 'Estudiantes atendidas',
        value: String(estudiantesUnicas),
        sub: 'únicas atendidas',
        color: 'text-olive',
      },
      {
        label: 'Calificación promedio',
        value: calStr,
        sub: '★★★★★',
        color: 'text-rose',
      },
      {
        label: 'Ingresos este mes',
        value: '—',
        sub: 'próximamente disponible',
        color: 'text-faded',
      },
    ]
  }, [todasLasSesiones, perfilMentora])

  const pendientes = useMemo(() => sesionesPendienteQuery.map(mapSesionPendiente), [sesionesPendienteQuery])

  const actividad = useMemo(() => {
    return todasLasSesiones
      .filter((s) => String(s.estado).toLowerCase() === 'completada')
      .sort((a, b) => {
        const ta = a.fecha_hora ? new Date(a.fecha_hora).getTime() : 0
        const tb = b.fecha_hora ? new Date(b.fecha_hora).getTime() : 0
        return tb - ta
      })
      .slice(0, 3)
      .map((s) => ({
        id: s.id,
        texto: `Sesión completada · ${s.asignatura ?? ''}`,
        tiempo: formatRelativo(s.fecha_hora),
      }))
  }, [todasLasSesiones])

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <div className="rounded-2xl bg-gradient-to-r from-cream to-rose-light p-6">
        <h1 className="font-display text-2xl text-ink">Mi panel — Mentora</h1>
        <p className="mt-1 text-sm text-stone">
          Bienvenida, {nombre}. Aquí está el resumen de tu actividad como mentora.
        </p>
      </div>

      {cargando ? (
        <p className="py-8 text-center text-sm text-stone">Cargando datos...</p>
      ) : null}

      {!cargando && error ? (
        <p className="rounded-2xl border border-rose bg-blush px-4 py-3 text-sm text-rose-dark">{error}</p>
      ) : null}

      {!cargando ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {kpi.map((k) => (
              <div key={k.label} className="rounded-2xl border border-line bg-white p-5">
                <p className="text-sm text-stone">{k.label}</p>
                <p className={`mt-1 font-display text-3xl font-semibold ${k.color}`}>{k.value}</p>
                <p className="mt-1 text-xs text-faded">{k.sub}</p>
              </div>
            ))}
          </div>

          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-display text-lg text-ink">Sesiones pendientes</h2>
            <ul className="mt-2 list-none divide-y divide-cream-2 p-0">
              {pendientes.length === 0 ? (
                <li className="py-3 text-sm text-faded first:pt-0">No tienes sesiones pendientes.</li>
              ) : (
                pendientes.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 py-3 first:pt-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose text-sm font-semibold text-ink">
                      {p.nombre.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink">{p.nombre}</p>
                      <p className="text-xs text-faded">{p.detalle}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                        p.estado === 'Pendiente' ? 'bg-[#FDF3E3] text-[#D4884A]' : 'bg-mint text-olive'
                      }`}
                    >
                      {p.estado}
                    </span>
                  </li>
                ))
              )}
            </ul>
            <Link to="/mentora/agenda" className="mt-4 inline-block text-sm font-medium text-rose-dark hover:underline">
              Ver agenda completa →
            </Link>
          </section>

          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-display text-lg text-ink">Actividad reciente</h2>
            <ul className="mt-2 list-none p-0">
              {actividad.length === 0 ? (
                <li className="py-2 text-sm text-faded">Sin actividad reciente.</li>
              ) : (
                actividad.map((a) => (
                  <li key={a.id} className="flex gap-3 py-2">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-rose" aria-hidden="true" />
                    <div>
                      <p className="text-sm text-ink">{a.texto}</p>
                      <span className="mt-0.5 block text-xs text-faded">{a.tiempo}</span>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>
        </>
      ) : null}
    </div>
  )
}
