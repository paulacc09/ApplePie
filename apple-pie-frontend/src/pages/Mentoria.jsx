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
    carrera: raw.carrera ?? raw.programa ?? '',
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
  const [carrera, setCarrera] = useState('')
  const [carrerasOptions, setCarrerasOptions] = useState([''])
  const [postulacionOpen, setPostulacionOpen] = useState(false)
  const [postulacion, setPostulacion] = useState({
    experiencia: '',
    especialidades: '',
    bio: '',
  })
  const [postulando, setPostulando] = useState(false)
  const [postulacionError, setPostulacionError] = useState('')
  const [postulacionOk, setPostulacionOk] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadInitialMentoras() {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get('/api/mentoras', {
          params: carrera ? { carrera } : undefined,
        })
        if (!cancelled) {
          const mapped = normalizeList(data).map(mapMentora)
          setMentoras(mapped)
          if (!carrera) {
            const carreras = Array.from(
              new Set(mapped.map((m) => m.carrera).filter((c) => typeof c === 'string' && c.trim())),
            ).sort()
            setCarrerasOptions(['', ...carreras])
          }
        }
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
  }, [carrera])

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return mentoras.filter((m) => {
      const ok =
        !s ||
        m.nombre.toLowerCase().includes(s) ||
        String(m.carrera).toLowerCase().includes(s) ||
        String(m.asignaturas).toLowerCase().includes(s) ||
        m.tags.some((t) => String(t).toLowerCase().includes(s))
      return ok
    })
  }, [mentoras, q])

  function handlePostulacionChange(e) {
    const { name, value } = e.target
    setPostulacion((prev) => ({ ...prev, [name]: value }))
  }

  function openPostulacion() {
    setPostulacionError('')
    setPostulacionOk('')
    setPostulacionOpen(true)
  }

  async function handlePostularse(e) {
    e.preventDefault()
    setPostulacionError('')
    setPostulacionOk('')
    setPostulando(true)
    try {
      const { data } = await api.post('/api/mentoras/postular', {
        experiencia: postulacion.experiencia,
        especialidades: postulacion.especialidades,
        bio: postulacion.bio,
      })
      setPostulacionOk(
        typeof data?.message === 'string' && data.message ? data.message : 'Postulación enviada para aprobación.',
      )
    } catch (e) {
      setPostulacionError(getErrorMessage(e))
    } finally {
      setPostulando(false)
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
          <select
            aria-label="Carrera"
            value={carrera}
            onChange={(e) => setCarrera(e.target.value)}
            className={selectClass}
          >
            <option value="">Carrera</option>
            {carrerasOptions.filter(Boolean).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={openPostulacion}
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

      {postulacionOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-6">
          <div className="w-full max-w-lg rounded-2xl border border-line bg-white p-6 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-xl text-ink">Postulación mentora</h2>
                <p className="mt-1 text-sm text-stone">
                  Completa tu experiencia, especialidades y bio. Admin revisará tu postulación antes de activar el rol.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPostulacionOpen(false)}
                className="rounded-lg px-2 py-1 text-sm text-stone hover:bg-warm"
                aria-label="Cerrar postulación"
              >
                ×
              </button>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handlePostularse}>
              <label className="block text-sm font-medium text-ink">
                Experiencia
                <textarea
                  name="experiencia"
                  value={postulacion.experiencia}
                  onChange={handlePostulacionChange}
                  required
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-line bg-warm px-3 py-2 text-sm text-ink outline-none ring-rose/30 focus:ring-2"
                  placeholder="Cuéntanos tu experiencia enseñando o acompañando estudiantes."
                />
              </label>

              <label className="block text-sm font-medium text-ink">
                Especialidades
                <textarea
                  name="especialidades"
                  value={postulacion.especialidades}
                  onChange={handlePostulacionChange}
                  required
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-line bg-warm px-3 py-2 text-sm text-ink outline-none ring-rose/30 focus:ring-2"
                  placeholder="Ej: UX Research, prototipado, entrevistas, Figma"
                />
              </label>

              <label className="block text-sm font-medium text-ink">
                Bio
                <textarea
                  name="bio"
                  value={postulacion.bio}
                  onChange={handlePostulacionChange}
                  required
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-line bg-warm px-3 py-2 text-sm text-ink outline-none ring-rose/30 focus:ring-2"
                  placeholder="Escribe una breve presentación para tu perfil."
                />
              </label>

              {postulacionError ? (
                <p className="rounded-xl border border-rose bg-blush px-4 py-3 text-sm text-rose-dark">
                  {postulacionError}
                </p>
              ) : null}

              {postulacionOk ? (
                <p className="rounded-xl border border-olive bg-mint px-4 py-3 text-sm text-olive">{postulacionOk}</p>
              ) : null}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setPostulacionOpen(false)}
                  className="rounded-xl border border-line px-4 py-2 text-sm font-medium text-stone hover:bg-warm"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  disabled={postulando}
                  className="rounded-xl bg-olive px-4 py-2 text-sm font-medium text-white transition-all hover:bg-olive-deep disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {postulando ? 'Enviando…' : 'Enviar postulación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
