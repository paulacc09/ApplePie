import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../api/axios.js'
import { getErrorMessage } from '../lib/apiError.js'

const diasSemana = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function AgendaMentora() {
  const [sesiones, setSesiones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [mes, setMes] = useState(() => new Date().getMonth())
  const [anio, setAnio] = useState(() => new Date().getFullYear())
  const [confirmandoId, setConfirmandoId] = useState(null)

  const cargarSesiones = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setCargando(true)
      setError(null)
    }
    try {
      const res = await api.get('/api/sesiones/mentora')
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.sesiones)
          ? res.data.sesiones
          : Array.isArray(res.data?.data)
            ? res.data.data
            : []
      setSesiones(data)
      setError(null)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      if (!silent) setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarSesiones()
  }, [cargarSesiones])

  const conSesion = useMemo(() => {
    const s = new Set()
    sesiones.forEach((ses) => {
      if (!ses.fecha_hora) return
      const d = new Date(ses.fecha_hora)
      if (d.getMonth() === mes && d.getFullYear() === anio) {
        s.add(d.getDate())
      }
    })
    return s
  }, [sesiones, mes, anio])

  const hoyNum = useMemo(() => {
    const h = new Date()
    if (mes === h.getMonth() && anio === h.getFullYear()) return h.getDate()
    return null
  }, [mes, anio])

  const tituloMes = useMemo(() => {
    const s = new Date(anio, mes).toLocaleString('es-CO', { month: 'long', year: 'numeric' })
    return s.charAt(0).toUpperCase() + s.slice(1)
  }, [mes, anio])

  const firstDow = useMemo(() => new Date(anio, mes, 1).getDay(), [anio, mes])

  const nums = useMemo(
    () => Array.from({ length: new Date(anio, mes + 1, 0).getDate() }, (_, i) => i + 1),
    [anio, mes],
  )

  const padded = useMemo(() => [...Array(firstDow).fill(null), ...nums], [firstDow, nums])

  const semana = useMemo(() => {
    const hoy = new Date()
    const lunes = new Date(hoy)
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7))
    lunes.setHours(0, 0, 0, 0)
    const domingo = new Date(lunes)
    domingo.setDate(lunes.getDate() + 6)
    domingo.setHours(23, 59, 59, 999)
    return sesiones
      .filter((s) => {
        if (!s.fecha_hora) return false
        if (String(s.estado).toLowerCase() === 'completada' || String(s.estado).toLowerCase() === 'cancelada')
          return false
        const d = new Date(s.fecha_hora)
        return d >= lunes && d <= domingo
      })
      .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora))
  }, [sesiones])

  const historial = useMemo(
    () =>
      sesiones
        .filter((s) => String(s.estado).toLowerCase() === 'completada')
        .sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora)),
    [sesiones],
  )

  function mesAnterior() {
    if (mes === 0) {
      setMes(11)
      setAnio((a) => a - 1)
    } else {
      setMes((m) => m - 1)
    }
  }

  function mesSiguiente() {
    if (mes === 11) {
      setMes(0)
      setAnio((a) => a + 1)
    } else {
      setMes((m) => m + 1)
    }
  }

  async function handleConfirmar(s) {
    setConfirmandoId(s.id)
    setError(null)
    try {
      await api.put('/api/sesiones/' + s.id, { estado: 'confirmada' })
      await cargarSesiones({ silent: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setConfirmandoId(null)
    }
  }

  function formatHoraSemana(s) {
    const dm = s.fecha_hora
      ? new Date(s.fecha_hora).toLocaleString('es-CO', {
          weekday: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—'
    const horas = ((Number(s.duracion_min) || 0) / 60).toFixed(1)
    return `${dm} - ${horas}h`
  }

  function formatDuracionHistorial(s) {
    const m = Number(s.duracion_min)
    if (m == null || Number.isNaN(m)) return '—'
    if (m >= 60) return `${Math.floor(m / 60)} h`
    return `${m} min`
  }

  function badgeEstadoClase(estado) {
    const e = String(estado ?? '').toLowerCase()
    if (e === 'completada') return 'font-medium text-olive'
    return 'font-medium text-[#D4884A]'
  }

  return (
    <div className="mx-auto max-w-6xl pb-10">
      <h1 className="mb-6 font-display text-2xl text-ink">Mi agenda</h1>

      {cargando ? (
        <p className="py-12 text-center text-sm text-stone">Cargando agenda...</p>
      ) : null}

      {!cargando && error ? (
        <p className="mb-4 rounded-2xl border border-rose bg-blush px-4 py-3 text-sm text-rose-dark">{error}</p>
      ) : null}

      {!cargando ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-2xl border border-line bg-white p-6">
              <div className="flex items-center justify-between">
                <button type="button" className="text-lg text-rose-dark" onClick={mesAnterior}>
                  ‹
                </button>
                <h2 className="font-display text-lg text-ink">{tituloMes}</h2>
                <button type="button" className="text-lg text-rose-dark" onClick={mesSiguiente}>
                  ›
                </button>
              </div>
              <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-faded">
                {diasSemana.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1 text-center text-sm">
                {padded.map((d, idx) => {
                  if (d == null) {
                    return <div key={`e-${idx}`} className="py-1" />
                  }
                  const ses = conSesion.has(d)
                  const sel = hoyNum != null && d === hoyNum
                  const res = conSesion.has(d) && !sel
                  return (
                    <div key={d} className="flex flex-col items-center py-1">
                      <button
                        type="button"
                        className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                          sel ? 'bg-rose text-white' : res ? 'bg-rose-light text-ink' : 'text-ink hover:bg-rose-light'
                        }`}
                      >
                        {d}
                      </button>
                      {ses ? <span className="mt-0.5 block h-1 w-1 rounded-full bg-rose" aria-hidden="true" /> : null}
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-stone">
                <span>
                  <span className="text-rose" aria-hidden="true">
                    ●
                  </span>{' '}
                  Sesión agendada
                </span>
                <span>
                  <span className="text-ink" aria-hidden="true">
                    ●
                  </span>{' '}
                  Hoy
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-white p-5">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-display text-lg text-ink">Historial de sesiones</h2>
                <span className="text-sm text-faded">{historial.length} sesiones realizadas</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-cream text-xs uppercase tracking-wider text-stone">
                      <th className="px-3 py-3">Estudiante</th>
                      <th className="px-3 py-3">Asignatura</th>
                      <th className="px-3 py-3">Fecha</th>
                      <th className="px-3 py-3">Duración</th>
                      <th className="px-3 py-3">Valoración</th>
                      <th className="px-3 py-3">Pago</th>
                      <th className="px-3 py-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="text-ink">
                    {historial.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="border-b border-cream-2 px-3 py-6 text-center text-sm text-faded">
                          No hay sesiones completadas aún.
                        </td>
                      </tr>
                    ) : (
                      historial.map((s) => (
                        <tr key={s.id} className="border-b border-cream-2">
                          <td className="px-3 py-3">{'Estudiante #' + s.estudiante_id}</td>
                          <td className="px-3 py-3">{s.asignatura ?? '—'}</td>
                          <td className="px-3 py-3">
                            {s.fecha_hora
                              ? new Date(s.fecha_hora).toLocaleDateString('es-CO', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '—'}
                          </td>
                          <td className="px-3 py-3">{formatDuracionHistorial(s)}</td>
                          <td className="px-3 py-3 text-xs text-faded">—</td>
                          <td className="px-3 py-3 text-xs text-faded">—</td>
                          <td className="px-3 py-3">
                            <span className={badgeEstadoClase(s.estado)}>{s.estado ?? '—'}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-2xl border border-line bg-white p-5">
              <h2 className="font-display text-base text-ink">Sesiones de esta semana</h2>
              <div className="mt-3 space-y-3">
                {semana.length === 0 ? (
                  <p className="text-sm text-faded">No hay sesiones esta semana.</p>
                ) : (
                  semana.map((s) => {
                    const yaConfirmada = String(s.estado).toLowerCase() === 'confirmada'
                    return (
                      <div
                        key={s.id}
                        className="rounded-xl bg-cream p-4 transition-colors hover:bg-rose-light"
                      >
                        <div className="flex gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose text-sm font-semibold text-ink">
                            {String(s.estudiante_id).charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-ink">{'Estudiante #' + s.estudiante_id}</p>
                            <p className="text-xs text-faded">{s.asignatura ?? 'Sin asignatura'}</p>
                            <p className="mt-1 text-xs text-faded">{formatHoraSemana(s)}</p>
                            <div className="mt-2 flex gap-2">
                              <button
                                type="button"
                                disabled={yaConfirmada || confirmandoId === s.id}
                                onClick={() => {
                                  if (!yaConfirmada) void handleConfirmar(s)
                                }}
                                className={
                                  yaConfirmada
                                    ? 'cursor-not-allowed rounded-lg bg-rose px-3 py-1.5 text-xs font-medium text-ink opacity-50'
                                    : 'rounded-lg bg-rose px-3 py-1.5 text-xs font-medium text-ink hover:bg-rose-dark disabled:cursor-not-allowed disabled:opacity-50'
                                }
                              >
                                {yaConfirmada
                                  ? 'Confirmada ✓'
                                  : confirmandoId === s.id
                                    ? 'Confirmando...'
                                    : 'Confirmar'}
                              </button>
                              <button
                                type="button"
                                onClick={() => window.alert('Funcionalidad próximamente disponible')}
                                className="rounded-lg border border-rose bg-white px-3 py-1.5 text-xs font-medium text-rose-dark hover:bg-rose-light"
                              >
                                Reagendar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
