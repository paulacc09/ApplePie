import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../api/axios.js'
import { getErrorMessage } from '../lib/apiError.js'

const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function normalizeSesionesList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.sesiones)) return data.sesiones
  return []
}

function sesionEnMes(s, mes, anio) {
  if (!s?.fecha_hora) return false
  const d = new Date(s.fecha_hora)
  return d.getMonth() === mes && d.getFullYear() === anio
}

function eventCardClasses(estado) {
  const e = String(estado ?? '').toLowerCase()
  if (e === 'pendiente') return 'rounded-lg border-l-4 border-rose bg-rose-light px-3 py-2'
  if (e === 'confirmada') return 'rounded-lg border-l-4 border-olive bg-mint px-3 py-2'
  if (e === 'completada') return 'rounded-lg border-l-4 border-line bg-cream px-3 py-2'
  return 'rounded-lg border-l-4 border-line bg-warm px-3 py-2'
}

function estadoLabelSpanClass(estado) {
  const e = String(estado ?? '').toLowerCase()
  if (e === 'pendiente') return 'text-xs font-medium text-rose-dark'
  if (e === 'confirmada') return 'text-xs font-medium text-olive'
  if (e === 'completada') return 'text-xs font-medium text-stone'
  return 'text-xs font-medium text-faded'
}

function estadoTexto(estado) {
  const e = String(estado ?? '').toLowerCase()
  if (e === 'pendiente') return 'Pendiente'
  if (e === 'confirmada') return 'Confirmada'
  if (e === 'completada') return 'Completada'
  return estado ? String(estado) : '—'
}

export default function MiAgenda() {
  const [sesiones, setSesiones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [mes, setMes] = useState(() => new Date().getMonth())
  const [anio, setAnio] = useState(() => new Date().getFullYear())

  const cargarSesiones = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setCargando(true)
      setError(null)
    }
    try {
      const res = await api.get('/api/sesiones/estudiante')
      setSesiones(normalizeSesionesList(res.data))
      setError(null)
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      if (!silent) setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarSesiones()
  }, [cargarSesiones])

  const tituloMes = useMemo(() => {
    const s = new Date(anio, mes).toLocaleString('es-CO', { month: 'long', year: 'numeric' })
    return s.charAt(0).toUpperCase() + s.slice(1)
  }, [mes, anio])

  const firstDow = useMemo(() => {
    const js = new Date(anio, mes, 1).getDay()
    return js === 0 ? 6 : js - 1
  }, [anio, mes])

  const nums = useMemo(
    () => Array.from({ length: new Date(anio, mes + 1, 0).getDate() }, (_, i) => i + 1),
    [anio, mes],
  )

  const padded = useMemo(() => [...Array(firstDow).fill(null), ...nums], [firstDow, nums])

  const calendarCells = useMemo(() => {
    const cells = [...padded]
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [padded])

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

  const sesionesMes = useMemo(() => {
    return sesiones
      .filter((s) => sesionEnMes(s, mes, anio))
      .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora))
  }, [sesiones, mes, anio])

  const mesAnterior = useCallback(() => {
    if (mes === 0) {
      setMes(11)
      setAnio((a) => a - 1)
    } else {
      setMes((m) => m - 1)
    }
  }, [mes])

  const mesSiguiente = useCallback(() => {
    if (mes === 11) {
      setMes(0)
      setAnio((a) => a + 1)
    } else {
      setMes((m) => m + 1)
    }
  }, [mes])

  function handleCrearEvento() {
    window.alert('Creación de eventos disponible próximamente')
  }

  return (
    <div className="rounded-2xl border border-line bg-warm p-6 shadow-card md:p-8">
      <div className="flex items-center justify-between">
        <button type="button" className="text-lg text-rose-dark" onClick={mesAnterior}>
          ‹
        </button>
        <h1 className="font-display text-xl text-ink">{tituloMes}</h1>
        <button type="button" className="text-lg text-rose-dark" onClick={mesSiguiente}>
          ›
        </button>
      </div>

      {cargando ? (
        <p className="mt-4 text-center text-sm text-faded">Cargando sesiones…</p>
      ) : null}

      {!cargando && error ? (
        <p className="mt-4 rounded-xl border border-rose bg-blush px-4 py-3 text-center text-sm text-rose-dark">{error}</p>
      ) : null}

      <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs text-faded">
        {days.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-2 text-center text-sm">
        {calendarCells.map((d, idx) => {
          if (d == null) {
            return <div key={`e-${idx}`} className="py-2" />
          }
          const tiene = conSesion.has(d)
          const sel = hoyNum != null && d === hoyNum
          const res = tiene && !sel
          return (
            <button
              key={`${anio}-${mes}-${d}`}
              type="button"
              className={`rounded-full py-2 transition-colors ${
                sel ? 'bg-rose text-white' : res ? 'bg-rose-light text-ink' : 'text-ink hover:bg-rose-light'
              }`}
            >
              {d}
            </button>
          )
        })}
      </div>
      <div className="mt-8 space-y-3">
        {!cargando && !error && sesionesMes.length === 0 ? (
          <p className="rounded-xl border border-line bg-cream px-4 py-6 text-center text-sm text-faded">
            No hay sesiones en este mes.
          </p>
        ) : null}
        {!cargando && !error
          ? sesionesMes.map((s) => {
              const dt = s.fecha_hora ? new Date(s.fecha_hora) : null
              const fechaStr = dt
                ? dt.toLocaleDateString('es-CO', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : '—'
              const horaStr = dt
                ? dt.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
                : '—'
              const asig = s.asignatura?.trim() || 'Sesión'
              return (
                <div key={s.id} className={eventCardClasses(s.estado)}>
                  <span className={estadoLabelSpanClass(s.estado)}>{estadoTexto(s.estado)}</span>
                  <p className="text-sm text-ink">
                    {asig} — {horaStr}
                  </p>
                  <p className="text-xs text-faded">{fechaStr}</p>
                </div>
              )
            })
          : null}
      </div>
      <button
        type="button"
        onClick={handleCrearEvento}
        className="mt-8 w-full rounded-xl bg-rose px-5 py-2.5 text-sm font-medium text-ink shadow-sm hover:bg-rose-dark"
      >
        CREAR EVENTO
      </button>
    </div>
  )
}
