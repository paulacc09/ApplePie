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

const eventCardClasses = 'rounded-lg border-l-4 border-olive bg-mint px-3 py-2'

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
          <p className="rounded-xl border border-line bg-cream px-4 py-6 text-center text-sm text-faded">
            No hay eventos en este mes.
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
                <div key={e.id} className={eventCardClasses}>
                  <p className="text-sm font-semibold text-ink">{e.nombre}</p>
                  <p className="text-xs text-stone">
                    {fechaStr} · {e.hora ?? '—'}
                  </p>
                  <p className="text-xs text-faded">{e.comunidad_nombre}</p>
                  {e.meet_link ? (
                    <a
                      href={e.meet_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-rose-dark underline"
                    >
                      Unirse a Meet →
                    </a>
                  ) : null}
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
