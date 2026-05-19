import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/axios.js'
import { getErrorMessage } from '../lib/apiError.js'
import { useAuth } from '../context/AuthContext.jsx'
import ModalPago from '../components/ModalPago.jsx'

const tabs = [
  { id: 'cursos', label: 'Cursos' },
  { id: 'tarifas', label: 'Tarifas' },
  { id: 'archivos', label: 'Archivos' },
  { id: 'sobre', label: 'Sobre mí' },
]

function splitTags(text) {
  if (Array.isArray(text)) return text.filter(Boolean)
  if (typeof text !== 'string' || !text.trim()) return []
  return text
    .split(/[·,]/)
    .map((t) => t.trim())
    .filter(Boolean)
}

function mapMentoraProfile(raw) {
  const materiasVal = raw.especialidades ?? raw.asignatura ?? raw.materias
  const materiasStr = Array.isArray(materiasVal) ? materiasVal.join(', ') : (materiasVal ?? '')
  const tags = splitTags(raw.tags ?? materiasVal)
  const nombre = raw.nombre ?? ''
  const apellido = raw.apellido ?? ''
  const experiencia = raw.experiencia ?? ''
  const especialidades = splitTags(raw.especialidades)

  return {
    usuario_id: raw.usuario_id,
    nombre,
    apellido,
    nombreCompleto: [nombre, apellido].filter(Boolean).join(' '),
    carrera: raw.programa ?? raw.carrera ?? raw.universidad ?? '',
    bio: raw.bio_mentora ?? raw.bio ?? raw.descripcion ?? '',
    experiencia,
    especialidades,
    rating: raw.calificacion ?? raw.rating ?? 0,
    totalSesiones: raw.total_sesiones ?? raw.horas_totales ?? raw.horas ?? 0,
    materias: materiasStr,
    tags,
    contacto: {
      lugar: raw.ciudad ?? '',
      email: raw.email ?? '',
      horario: raw.horario ?? '',
    },
    cursos: Array.isArray(raw.cursos) ? raw.cursos : [],
    archivos: Array.isArray(raw.archivos) ? raw.archivos : [],
  }
}

function fileBadge(tipo) {
  if (tipo === 'PDF')
    return <span className="rounded bg-blush px-2 py-2 text-xs font-bold text-rose-dark">PDF</span>
  if (tipo === 'DOCX')
    return <span className="rounded bg-[#E8F0FE] px-2 py-2 text-xs font-bold text-[#5B7FD4]">DOC</span>
  return <span className="rounded bg-[#FDF3E3] px-2 py-2 text-xs font-bold text-[#D4884A]">PPT</span>
}

export default function PerfilMentora() {
  const { id } = useParams()
  const { user } = useAuth()
  const [tab, setTab] = useState('cursos')
  const [pagoOpen, setPagoOpen] = useState(false)
  const [planSel, setPlanSel] = useState({ nombre: 'Individual', precio: '$35.000' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mentora, setMentora] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!id) {
        setLoading(false)
        setError('Perfil no encontrado.')
        return
      }
      setLoading(true)
      setError('')
      setMentora(null)
      try {
        const { data } = await api.get(`/api/mentoras/${id}`)
        if (!cancelled) setMentora(mapMentoraProfile(data))
      } catch (e) {
        if (!cancelled) {
          setError(getErrorMessage(e))
          setMentora(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  const esMio = useMemo(() => {
    const uid = user?.id ?? user?._id
    if (uid == null || !mentora?.usuario_id) return false
    return String(uid) === String(mentora.usuario_id)
  }, [user, mentora])

  const inicial = (mentora?.nombreCompleto || mentora?.nombre || '?').trim().charAt(0).toUpperCase()

  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-10">
      <Link to="/mentoria" className="text-sm font-medium text-rose-dark hover:underline">
        ← Volver a mentorías
      </Link>

      {loading ? (
        <div className="flex min-h-[12rem] flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-warm py-12">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-rose-light border-t-rose-dark"
            role="status"
            aria-label="Cargando"
          />
          <p className="text-sm text-stone">Cargando perfil…</p>
        </div>
      ) : null}

      {!loading && error ? (
        <p className="rounded-xl border border-rose bg-blush px-4 py-3 text-sm text-rose-dark">{error}</p>
      ) : null}

      {!loading && !error && mentora ? (
        <>
          <header className="relative rounded-2xl border border-line bg-white p-6">
            {esMio ? (
              <button
                type="button"
                className="absolute right-4 top-4 text-faded hover:text-rose-dark"
                aria-label="Ajustes de perfil"
              >
                ⚙️
              </button>
            ) : null}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-olive text-2xl font-semibold text-white">
                {inicial}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-xl text-ink">{mentora.nombreCompleto || mentora.nombre}</h1>
                <p className="text-sm text-stone">{mentora.carrera}</p>
                <p className="mt-2 text-sm text-stone">
                  <span aria-hidden="true">⭐</span> {mentora.rating} · <span className="mx-1">·</span> 📚{' '}
                  {mentora.materias || 'Sin especialidades'} · 🕐 {mentora.totalSesiones} sesiones
                </p>
                {mentora.bio ? <p className="mt-3 text-sm italic text-stone">{mentora.bio}</p> : null}
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-faded">
                  {mentora.contacto.lugar ? <span>📍 {mentora.contacto.lugar}</span> : null}
                  {mentora.contacto.email ? <span>✉️ {mentora.contacto.email}</span> : null}
                  {mentora.contacto.horario ? <span>🕐 {mentora.contacto.horario}</span> : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {mentora.tags.map((t) => (
                    <span key={t} className="rounded-full bg-rose-light px-2 py-0.5 text-xs text-rose-dark">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </header>

          <div className="flex gap-1 rounded-xl bg-cream p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  tab === t.id ? 'bg-olive text-white' : 'text-stone hover:text-ink'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'cursos' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mentora.cursos.length === 0 ? (
                <p className="col-span-full rounded-2xl border border-line bg-white py-10 text-center text-sm text-stone">
                  Sin contenido disponible
                </p>
              ) : (
                mentora.cursos.map((c) => (
                  <article
                    key={c.id ?? c.nombre}
                    className="rounded-2xl border border-line bg-white p-4 transition-all hover:border-rose"
                  >
                    <h3 className="font-medium text-ink">{c.nombre}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-stone">{c.desc}</p>
                    <span className="mt-2 inline-block rounded-full bg-mint px-2 py-0.5 text-xs text-olive">
                      {c.nivel}
                    </span>
                    <button
                      type="button"
                      className="mt-3 w-full rounded-xl border border-rose bg-white py-2 text-sm font-medium text-rose-dark transition-all hover:bg-rose-light"
                    >
                      Ver curso
                    </button>
                  </article>
                ))
              )}
            </div>
          ) : null}

          {tab === 'tarifas' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border-2 border-rose bg-[#FFF8F9] p-5 text-center">
                <p className="text-2xl" aria-hidden="true">
                  👤
                </p>
                <h3 className="mt-2 font-display text-lg text-ink">Individual</h3>
                <p className="text-xs text-stone">1 alumna</p>
                <p className="my-3 font-display text-3xl font-semibold text-rose-dark">$35.000</p>
                <button
                  type="button"
                  onClick={() => {
                    setPlanSel({ nombre: 'Individual', precio: '$35.000' })
                    setPagoOpen(true)
                  }}
                  className="w-full rounded-xl bg-rose py-2.5 text-sm font-medium text-ink shadow-sm hover:bg-rose-dark"
                >
                  Agendar y pagar
                </button>
              </div>
              <div className="rounded-2xl border-2 border-olive bg-[#F8FBF5] p-5 text-center">
                <p className="text-2xl" aria-hidden="true">
                  👥
                </p>
                <h3 className="mt-2 font-display text-lg text-ink">Grupal</h3>
                <p className="text-xs text-stone">Hasta 5 alumnas</p>
                <p className="my-3 font-display text-3xl font-semibold text-olive">$18.000</p>
                <button
                  type="button"
                  onClick={() => {
                    setPlanSel({ nombre: 'Grupal', precio: '$18.000' })
                    setPagoOpen(true)
                  }}
                  className="w-full rounded-xl bg-olive py-2.5 text-sm font-medium text-white hover:bg-olive-deep"
                >
                  Agendar y pagar
                </button>
              </div>
              <div className="rounded-2xl border-2 border-faded bg-[#FDFAFA] p-5 text-center">
                <p className="text-2xl" aria-hidden="true">
                  ⚡
                </p>
                <h3 className="mt-2 font-display text-lg text-ink">Intensiva</h3>
                <p className="text-xs text-stone">3 sesiones / semana</p>
                <p className="my-3 font-display text-3xl font-semibold text-stone">$95.000</p>
                <button
                  type="button"
                  onClick={() => {
                    setPlanSel({ nombre: 'Intensiva', precio: '$95.000' })
                    setPagoOpen(true)
                  }}
                  className="w-full rounded-xl border border-rose bg-white py-2.5 text-sm font-medium text-rose-dark hover:bg-rose-light"
                >
                  Agendar y pagar
                </button>
              </div>
            </div>
          ) : null}

          {tab === 'archivos' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {mentora.archivos.length === 0 ? (
                <p className="col-span-full rounded-2xl border border-line bg-white py-10 text-center text-sm text-stone">
                  Sin contenido disponible
                </p>
              ) : (
                mentora.archivos.map((a) => (
                  <article
                    key={a.id ?? a.nombre}
                    className="rounded-2xl border border-line bg-white p-4 transition-all hover:border-rose hover:shadow-sm"
                  >
                    <div className="flex justify-center">{fileBadge(a.tipo)}</div>
                    <h3 className="mt-3 text-sm font-medium text-ink">{a.nombre}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-stone">{a.desc}</p>
                    <p className="mt-2 font-semibold text-rose-dark">{a.precio}</p>
                    <button
                      type="button"
                      className="mt-3 w-full rounded-xl bg-rose py-2 text-sm font-medium text-ink shadow-sm hover:bg-rose-dark"
                    >
                      Comprar
                    </button>
                  </article>
                ))
              )}
            </div>
          ) : null}

          {tab === 'sobre' ? (
            <div className="space-y-6 rounded-2xl border border-line bg-white p-6">
              <section>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-olive">Bio</h4>
                <p className="text-sm text-ink">{mentora.bio || 'Sin bio registrada.'}</p>
              </section>
              <section>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-olive">Experiencia</h4>
                <p className="text-sm text-ink">{mentora.experiencia || 'Sin experiencia registrada.'}</p>
              </section>
              <section>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-olive">Especialidades</h4>
                {mentora.especialidades.length > 0 ? (
                  <ul className="list-inside list-disc space-y-1 text-sm text-ink marker:text-rose">
                    {mentora.especialidades.map((especialidad) => (
                      <li key={especialidad}>{especialidad}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-ink">Sin especialidades registradas.</p>
                )}
              </section>
              <section>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-olive">Resumen</h4>
                <p className="text-sm text-ink">
                  Calificación: {mentora.rating} · Total de sesiones: {mentora.totalSesiones}
                </p>
              </section>
            </div>
          ) : null}
        </>
      ) : null}

      <ModalPago
        open={pagoOpen}
        onClose={() => setPagoOpen(false)}
        planNombre={planSel.nombre}
        planPrecio={planSel.precio}
      />
    </div>
  )
}
