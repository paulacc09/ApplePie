import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../api/axios.js'
import { getErrorMessage } from '../lib/apiError.js'

const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function normalizeEventosList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.eventos)) return data.eventos
  return []
}

function eventoFecha(e) {
  if (!e?.fecha) return null
  const fecha = String(e.fecha)
  return /^\d{4}-\d{2}-\d{2}/.test(fecha) ? new Date(`${fecha.slice(0, 10)}T00:00:00`) : new Date(e.fecha)
}

function eventoEnMes(e, mes, anio) {
  const d = eventoFecha(e)
  if (!d || Number.isNaN(d.getTime())) return false
  return d.getMonth() === mes && d.getFullYear() === anio
}

function eventCardClasses(tipo) {
  return tipo === 'mentoria'
    ? 'mb-2 rounded-xl border-l-4 border-rose bg-rose-light p-3'
    : 'mb-2 rounded-xl border-l-4 border-olive bg-blush/30 p-3'
}

export default function MiAgenda() {
  const [eventos, setEventos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [mes, setMes] = useState(() => new Date().getMonth())
  const [anio, setAnio] = useState(() => new Date().getFullYear())

  useEffect(() => {
    let cancelled = false

    async function loadEventos() {
      setCargando(true)
      setError(null)
      try {
        const res = await api.get('/api/eventos')
        if (!cancelled) {
          setEventos(normalizeEventosList(res.data))
          setError(null)
        }
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e))
      } finally {
        if (!cancelled) setCargando(false)
      }
    }

    loadEventos()
    return () => {
      cancelled = true
    }
  }, [])

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

  const conEvento = useMemo(() => {
    const s = new Set()
    eventos.forEach((evento) => {
      const d = eventoFecha(evento)
      if (!d || Number.isNaN(d.getTime())) return
      if (d.getMonth() === mes && d.getFullYear() === anio) {
        s.add(d.getDate())
      }
    })
    return s
  }, [eventos, mes, anio])

  const hoyNum = useMemo(() => {
    const h = new Date()
    if (mes === h.getMonth() && anio === h.getFullYear()) return h.getDate()
    return null
  }, [mes, anio])

  const eventosMes = useMemo(() => {
    return eventos
      .filter((evento) => eventoEnMes(evento, mes, anio))
      .sort((a, b) => eventoFecha(a) - eventoFecha(b) || String(a.hora ?? '').localeCompare(String(b.hora ?? '')))
  }, [eventos, mes, anio])

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

  return (
    <div className="mx-auto w-full max-w-4xl rounded-2xl border border-line bg-warm px-6 py-6 shadow-card">
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
        <p className="mt-4 text-center text-sm text-faded">Cargando eventos…</p>
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
          const tiene = conEvento.has(d)
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
        {!cargando && !error && eventosMes.length === 0 ? (
          <p className="py-8 text-center text-sm text-faded">
            No tienes eventos ni sesiones agendadas.
          </p>
        ) : null}
        {!cargando && !error
          ? eventosMes.map((e) => {
              const dt = eventoFecha(e)
              const fechaStr = dt
                ? dt.toLocaleDateString('es-CO', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })
                : '—'
              return (
                <div key={`${e.tipo}-${e.id}`} className={eventCardClasses(e.tipo)}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-medium uppercase tracking-wide text-faded">
                        {e.tipo === 'mentoria' ? '📚 Mentoría' : '👥 Comunidad'}
                      </span>
                      <p className="mt-0.5 text-sm font-semibold text-ink">{e.nombre}</p>
                      <p className="text-xs text-stone">
                        {fechaStr} · {e.hora ?? '—'}
                      </p>
                      <p className="text-xs text-faded">{e.contexto}</p>
                    </div>
                    {e.meet_link ? (
                      <a
                        href={e.meet_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 rounded-lg bg-olive px-2 py-1 text-xs text-white hover:opacity-80"
                      >
                        Unirse →
                      </a>
                    ) : e.modalidad !== 'presencial' ? (
                      <a
                        href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(e.nombre)}&vcon=meet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 rounded-lg bg-gray-300 px-2 py-1 text-xs text-gray-600 hover:opacity-80"
                      >
                        Programar →
                      </a>
                    ) : null}
                  </div>
                  {e.descripcion ? (
                    <p className="mt-1 text-xs text-stone">{e.descripcion}</p>
                  ) : null}
                </div>
              )
            })
          : null}
      </div>
    </div>
  )
}
