import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/axios.js'
import { getErrorMessage } from '../lib/apiError.js'
import { useAuth } from '../context/AuthContext.jsx'
import ModalPago from '../components/ModalPago.jsx'

const inputBase =
  'w-full rounded-xl border border-rose bg-white px-4 py-3 text-ink placeholder:text-faded transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose'

const tabsBase = [
  { id: 'cursos', label: 'Cursos' },
  { id: 'tarifas', label: 'Tarifas' },
  { id: 'archivos', label: 'Archivos' },
  { id: 'sobre', label: 'Sobre mí' },
]

function nombreValoracion(v) {
  return [v.nombre, v.apellido].filter(Boolean).join(' ').trim() || 'Usuario'
}

function formatFechaValoracion(raw) {
  if (!raw) return '—'
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
}

function EstrellasLectura({ puntuacion }) {
  const n = Math.min(5, Math.max(0, Math.round(Number(puntuacion) || 0)))
  return (
    <span aria-label={`${n} de 5 estrellas`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < n ? 'text-rose' : 'text-faded'}>
          ★
        </span>
      ))}
    </span>
  )
}

function ListaValoraciones({ valoraciones }) {
  if (!valoraciones.length) {
    return <p className="text-sm text-stone">Sin reseñas aún.</p>
  }
  return (
    <ul className="list-none space-y-3 p-0">
      {valoraciones.map((v, index) => {
        const nombre = nombreValoracion(v)
        const inicial = nombre.charAt(0).toUpperCase()
        return (
          <li key={v.id ?? `${v.created_at}-${index}`} className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-olive text-xs font-semibold text-white">
              {inicial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">{nombre}</p>
              <p className="text-sm">
                <EstrellasLectura puntuacion={v.puntuacion} />
              </p>
              {v.comentario ? <p className="mt-0.5 text-xs italic text-stone">{v.comentario}</p> : null}
              <p className="mt-1 text-xs text-faded">{formatFechaValoracion(v.created_at)}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

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

const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

function tarifaIcono(tipo) {
  const t = String(tipo ?? '').toLowerCase()
  if (t === 'grupal') return '👥'
  if (t === 'intensiva') return '⚡'
  return '👤'
}

function capitalizarTipo(tipo) {
  const t = String(tipo ?? '').toLowerCase()
  if (!t) return ''
  return t.charAt(0).toUpperCase() + t.slice(1)
}

function subtituloTarifa(tarifa) {
  const n = Number(tarifa.max_alumnas)
  return n === 1 ? '1 alumna' : `Hasta ${n} alumnas`
}

function tarifaCardClass(tipo) {
  const t = String(tipo ?? '').toLowerCase()
  if (t === 'grupal') {
    return {
      card: 'rounded-2xl border-2 border-olive bg-[#F8FBF5] p-5 text-center',
      price: 'my-3 font-display text-3xl font-semibold text-olive',
      btn: 'w-full rounded-xl bg-olive py-2.5 text-sm font-medium text-white hover:bg-olive-deep',
    }
  }
  if (t === 'intensiva') {
    return {
      card: 'rounded-2xl border-2 border-faded bg-[#FDFAFA] p-5 text-center',
      price: 'my-3 font-display text-3xl font-semibold text-stone',
      btn: 'w-full rounded-xl border border-rose bg-white py-2.5 text-sm font-medium text-rose-dark hover:bg-rose-light',
    }
  }
  return {
    card: 'rounded-2xl border-2 border-rose bg-[#FFF8F9] p-5 text-center',
    price: 'my-3 font-display text-3xl font-semibold text-rose-dark',
    btn: 'w-full rounded-xl bg-rose py-2.5 text-sm font-medium text-ink shadow-sm hover:bg-rose-dark',
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
  const [tarifas, setTarifas] = useState([])
  const [cursos, setCursos] = useState([])
  const [valoraciones, setValoraciones] = useState([])
  const [stars, setStars] = useState(0)
  const [hoverStars, setHoverStars] = useState(0)
  const [comentarioResena, setComentarioResena] = useState('')

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
      setTarifas([])
      setCursos([])
      setValoraciones([])
      try {
        const [perfilRes, tarifasRes, cursosRes, valoracionesRes] = await Promise.all([
          api.get(`/api/mentoras/${id}`),
          api.get(`/api/mentoras/${id}/tarifas`),
          api.get(`/api/mentoras/${id}/cursos`),
          api.get(`/api/mentoras/${id}/valoraciones`),
        ])
        if (!cancelled) {
          setMentora(mapMentoraProfile(perfilRes.data))
          setTarifas(Array.isArray(tarifasRes.data) ? tarifasRes.data : [])
          setCursos(Array.isArray(cursosRes.data) ? cursosRes.data : [])
          setValoraciones(Array.isArray(valoracionesRes.data) ? valoracionesRes.data : [])
        }
      } catch (e) {
        if (!cancelled) {
          setError(getErrorMessage(e))
          setMentora(null)
          setTarifas([])
          setCursos([])
          setValoraciones([])
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

  const tabs = useMemo(() => {
    if (esMio) return tabsBase
    return [...tabsBase, { id: 'resenar', label: 'Reseñar' }]
  }, [esMio])

  const puedeEnviarResena = false

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
              {cursos.length === 0 ? (
                <p className="col-span-full rounded-2xl border border-line bg-white py-10 text-center text-sm text-stone">
                  Sin contenido disponible
                </p>
              ) : (
                cursos.map((c) => (
                  <article
                    key={c.id ?? c.titulo}
                    className="rounded-2xl border border-line bg-white p-4 transition-all hover:border-rose"
                  >
                    <h3 className="font-medium text-ink">{c.titulo}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-stone">{c.descripcion}</p>
                    <span className="mt-2 inline-block rounded-full bg-mint px-2 py-0.5 text-xs text-olive">
                      {c.asignatura}
                    </span>
                    <p className="mt-1 text-xs text-stone">{c.num_sesiones} sesiones</p>
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
              {tarifas.length === 0 ? (
                <p className="col-span-full rounded-2xl border border-line bg-white py-10 text-center text-sm text-stone">
                  Sin contenido disponible
                </p>
              ) : (
                tarifas.map((tarifa) => {
                  const styles = tarifaCardClass(tarifa.tipo)
                  return (
                    <div key={tarifa.id ?? tarifa.tipo} className={styles.card}>
                      <p className="text-2xl" aria-hidden="true">
                        {tarifaIcono(tarifa.tipo)}
                      </p>
                      <h3 className="mt-2 font-display text-lg text-ink">{capitalizarTipo(tarifa.tipo)}</h3>
                      <p className="text-xs text-stone">{subtituloTarifa(tarifa)}</p>
                      <p className={styles.price}>{copFormatter.format(Number(tarifa.precio) || 0)}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setPlanSel({ nombre: tarifa.tipo, precio: tarifa.precio })
                          setPagoOpen(true)
                        }}
                        className={styles.btn}
                      >
                        Agendar y pagar
                      </button>
                    </div>
                  )
                })
              )}
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
              <section>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-olive">Reseñas</h4>
                <ListaValoraciones valoraciones={valoraciones} />
              </section>
            </div>
          ) : null}

          {tab === 'resenar' ? (
            <div className="rounded-2xl border border-line bg-white p-6">
              <p className="text-sm text-stone">Solo puedes reseñar después de completar una sesión.</p>
              <div className={`mt-4 space-y-4 ${puedeEnviarResena ? '' : 'pointer-events-none opacity-60'}`}>
                <div>
                  <p className="mb-2 text-sm font-medium text-ink">Tu calificación</p>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (_, i) => {
                      const value = i + 1
                      const activa = value <= (hoverStars || stars)
                      return (
                        <button
                          key={value}
                          type="button"
                          disabled={!puedeEnviarResena}
                          onMouseEnter={() => setHoverStars(value)}
                          onMouseLeave={() => setHoverStars(0)}
                          onClick={() => setStars(value)}
                          className={`text-2xl transition-colors ${activa ? 'text-rose' : 'text-faded'}`}
                          aria-label={`${value} estrellas`}
                        >
                          ★
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink">Comentario</label>
                  <textarea
                    rows={4}
                    value={comentarioResena}
                    onChange={(e) => setComentarioResena(e.target.value)}
                    disabled={!puedeEnviarResena}
                    className={`${inputBase} h-auto min-h-[6rem] resize-y`}
                    placeholder="Cuéntanos tu experiencia…"
                  />
                </div>
                <button
                  type="button"
                  disabled={!puedeEnviarResena}
                  className="rounded-xl bg-rose px-5 py-2.5 font-medium text-ink shadow-sm hover:bg-rose-dark disabled:opacity-60"
                >
                  Enviar reseña
                </button>
              </div>
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
