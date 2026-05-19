import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/axios.js'
import { getErrorMessage } from '../lib/apiError.js'
import MentorCard from '../components/MentorCard.jsx'

function normalizeList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.mentoras)) return data.mentoras
  if (Array.isArray(data?.data)) return data.data
  return []
}

function splitAsignaturas(text) {
  if (typeof text !== 'string' || !text.trim()) return []
  return text
    .split(/[·,]/)
    .map((t) => t.trim())
    .filter(Boolean)
}

function mapMentora(raw) {
  const asignStr = raw.asignatura ?? raw.asignaturas ?? raw.especialidades ?? ''
  let tags = raw.tags ?? (raw.asignatura ? [raw.asignatura] : splitAsignaturas(asignStr))
  if (!Array.isArray(tags)) {
    tags = tags != null && tags !== '' ? [String(tags)] : []
  }

  return {
    id: String(raw.id),
    nombre: raw.nombre,
    asignaturas: asignStr,
    rating: raw.rating ?? raw.calificacion ?? 0,
    horas: raw.horas_totales ?? raw.horas ?? raw.total_sesiones ?? 0,
    tags,
  }
}

const selectClass =
  'rounded-xl border border-rose bg-white px-3 py-2 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-rose'

export default function Mentoria() {
  const [mentoras, setMentoras] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [asig, setAsig] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadInitialMentoras() {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get('/api/mentoras')
        if (!cancelled) setMentoras(normalizeList(data).map(mapMentora))
      } catch (e) {
        if (!cancelled) {
          setError(getErrorMessage(e))
          setMentoras([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadInitialMentoras()
    return () => {
      cancelled = true
    }
  }, [])

  const asignaturasOptions = useMemo(() => {
    const s = new Set()
    for (const m of mentoras) {
      if (Array.isArray(m.tags)) {
        m.tags.forEach((t) => {
          if (t) s.add(String(t).trim())
        })
      }
      splitAsignaturas(m.asignaturas).forEach((t) => s.add(t))
    }
    return ['', ...Array.from(s).sort()]
  }, [mentoras])

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return mentoras.filter((m) => {
      const ok =
        !s ||
        m.nombre.toLowerCase().includes(s) ||
        String(m.asignaturas).toLowerCase().includes(s) ||
        m.tags.some((t) => String(t).toLowerCase().includes(s))
      const okA =
        !asig ||
        m.tags.includes(asig) ||
        splitAsignaturas(m.asignaturas).includes(asig) ||
        String(m.asignaturas).includes(asig)
      return ok && okA
    })
  }, [mentoras, q, asig])

  async function handlePostularse() {
    try {
      const { data } = await api.post('/api/mentoras/postularse', {})
      window.alert(
        typeof data?.message === 'string' && data.message
          ? data.message
          : data?.id != null
            ? 'Postulación enviada correctamente.'
            : 'Solicitud enviada.',
      )
    } catch (e) {
      window.alert(getErrorMessage(e))
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-6 py-6">
      <div className="mb-6 flex w-full flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-ink">Mentorías</h1>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            placeholder="Buscar mentora..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-full border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-faded shadow-sm focus:outline-none focus:ring-2 focus:ring-rose sm:w-56"
          />
          <select aria-label="Asignatura" value={asig} onChange={(e) => setAsig(e.target.value)} className={selectClass}>
            <option value="">Asignatura</option>
            {asignaturasOptions.filter(Boolean).map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handlePostularse}
            className="shrink-0 rounded-xl border border-rose bg-white px-4 py-2 text-sm font-medium text-rose-dark transition-all duration-200 hover:bg-rose-light"
          >
            Postularme como mentora
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[12rem] flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-warm py-12">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-rose-light border-t-rose-dark"
            role="status"
            aria-label="Cargando"
          />
          <p className="text-sm text-stone">Cargando mentoras…</p>
        </div>
      ) : null}

      {!loading && error ? (
        <p className="rounded-xl border border-rose bg-blush px-4 py-3 text-sm text-rose-dark">{error}</p>
      ) : null}

      {!loading && !error && list.length === 0 ? (
        <p className="rounded-2xl border border-line bg-warm px-6 py-10 text-center text-stone">No hay mentoras disponibles</p>
      ) : null}

      {!loading && !error && list.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((m) => (
            <MentorCard key={m.id} mentor={m} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
