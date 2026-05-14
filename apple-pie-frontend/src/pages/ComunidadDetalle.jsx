import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import LogoApplePie from '../components/LogoApplePie.jsx'
import { api } from '../api/axios.js'
import { getErrorMessage } from '../lib/apiError.js'

const MOCK_POSTS = [
  {
    id: 1,
    name: 'Laura Méndez',
    handle: '@lauram',
    time: 'Hace 2 h',
    text: '¿Alguien tiene los ejercicios resueltos de la guía 3?',
  },
  {
    id: 2,
    name: 'Camila Ruiz',
    handle: '@camruiz',
    time: 'Hace 5 h',
    text: 'Yo los subí al drive del grupo, revisen el canal de recursos.',
    replies: [{ name: 'Laura Méndez', text: '¡Gracias Cami! 💜' }],
  },
]

const MOCK_MEMBERS = [
  { name: 'Valentina Soto', role: 'mentora', info: 'Ingeniera civil · 8vo' },
  { name: 'Isabel Núñez', role: 'moderadora', info: 'Matemáticas · 6to' },
  { name: 'Paula Costa', role: 'estudiante', info: 'Cálculo III · 4to' },
]

function avatarBg(role) {
  if (role === 'mentora') return 'bg-olive'
  if (role === 'moderadora') return 'bg-rose'
  return 'bg-faded'
}

export default function ComunidadDetalle() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('foro')
  const [roleFilter, setRoleFilter] = useState('todos')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const { data: res } = await api.get(`/api/comunidades/${id}`)
        const payload = res?.comunidad ?? res?.data ?? res
        if (!cancelled) setData(payload && typeof payload === 'object' ? payload : null)
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (id) load()
    return () => {
      cancelled = true
    }
  }, [id])

  const nombre = data?.nombre ?? data?.name ?? 'Cálculo III – Grupo A'
  const materia = data?.materia ?? data?.subject ?? ''

  const membersShown =
    roleFilter === 'todos' ? MOCK_MEMBERS : MOCK_MEMBERS.filter((m) => m.role === roleFilter)

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-8 lg:max-w-3xl">
      <Link to="/comunidades" className="text-sm font-medium text-rose-dark hover:underline">
        ← Volver a comunidades
      </Link>

      <header className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <div className="flex items-center gap-3">
          <div className="hidden shrink-0 sm:block">
            <LogoApplePie to="/home" compact />
          </div>
          <div>
            <h1 className="font-display text-xl text-ink">{nombre}</h1>
            {materia ? <p className="text-sm text-olive">{materia}</p> : null}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-cream-2" aria-busy="true" />
      ) : null}

      {error ? (
        <p className="rounded-xl border border-rose bg-blush px-4 py-3 text-sm text-rose-dark">{error}</p>
      ) : null}

      {!loading && !error && data ? (
        <>
          <div className="flex gap-1 rounded-xl bg-cream p-1">
            {[
              { id: 'foro', label: 'Foro' },
              { id: 'calendario', label: 'Calendario' },
              { id: 'miembros', label: 'Miembros' },
              { id: 'recursos', label: 'Recursos' },
            ].map((t) => (
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

          {tab === 'foro' ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-line bg-warm p-4 shadow-card">
                <textarea
                  rows={3}
                  placeholder="¿Qué quieres compartir con el grupo?"
                  className="w-full resize-none border-0 bg-transparent text-sm text-ink outline-none placeholder:text-faded"
                />
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-faded">📎 Adjuntar archivo</span>
                  <button
                    type="button"
                    className="rounded-xl bg-rose px-4 py-2 text-xs font-medium text-ink shadow-sm hover:bg-rose-dark"
                  >
                    Publicar
                  </button>
                </div>
              </div>

              {MOCK_POSTS.map((p) => (
                <article key={p.id} className="rounded-2xl border border-line bg-warm p-4 shadow-card">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose text-xs font-semibold text-ink">
                      {p.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-sm font-medium text-ink">{p.name}</span>
                        <span className="text-xs text-faded">{p.handle}</span>
                        <span className="text-xs text-faded">{p.time}</span>
                      </div>
                      <p className="mt-2 text-sm text-ink">{p.text}</p>
                      <div className="mt-3 flex gap-4 text-xs text-faded">
                        <button type="button" className="hover:text-rose-dark">
                          💬 Responder
                        </button>
                        <button type="button" className="hover:text-rose-dark">
                          🤍 Me gusta
                        </button>
                      </div>
                      {p.replies?.length ? (
                        <div className="ml-2 mt-3 border-l-2 border-line pl-3">
                          {p.replies.map((r) => (
                            <p key={r.text} className="text-sm text-stone">
                              <span className="font-medium text-ink">{r.name}: </span>
                              {r.text}
                            </p>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          {tab === 'calendario' ? (
            <div className="rounded-2xl border border-line bg-warm p-6 shadow-card">
              <div className="flex items-center justify-between">
                <button type="button" className="text-rose-dark">
                  ‹
                </button>
                <h2 className="font-display text-lg text-ink">Mayo 2026</h2>
                <button type="button" className="text-rose-dark">
                  ›
                </button>
              </div>
              <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-faded">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
              <div className="mt-2 space-y-2">
                <div className="rounded-lg border-l-4 border-rose bg-rose-light px-3 py-2 text-sm text-ink">
                  <span className="rounded bg-rose-light px-2 py-0.5 text-xs font-medium text-rose-dark">
                    Sesión grupal
                  </span>
                  <p className="mt-1">Repaso integral — 16:00</p>
                </div>
                <div className="rounded-lg border-l-4 border-olive bg-mint px-3 py-2 text-sm text-ink">
                  <span className="rounded bg-mint px-2 py-0.5 text-xs font-medium text-olive">Taller grupal</span>
                  <p className="mt-1">Estrategias de estudio — 10:00</p>
                </div>
              </div>
              <button
                type="button"
                className="mt-6 w-full rounded-xl bg-rose px-5 py-2 text-sm font-medium text-ink shadow-sm hover:bg-rose-dark"
              >
                CREAR EVENTO
              </button>
            </div>
          ) : null}

          {tab === 'miembros' ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {['todos', 'mentora', 'moderadora', 'estudiante'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRoleFilter(r)}
                    className={`rounded-full px-4 py-1.5 text-sm transition-all duration-200 ${
                      roleFilter === r
                        ? 'bg-olive text-white'
                        : 'border border-rose bg-warm text-stone hover:text-ink'
                    }`}
                  >
                    {r === 'todos' ? 'Todos' : r}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {membersShown.map((m) => (
                  <div
                    key={m.name}
                    className="rounded-2xl border border-line bg-warm p-4 text-center shadow-card transition-all hover:border-rose hover:shadow-card-hover"
                  >
                    <div
                      className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold text-white ${avatarBg(m.role)}`}
                    >
                      {m.name.charAt(0)}
                    </div>
                    <span
                      className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${avatarBg(m.role)}`}
                    >
                      {m.role}
                    </span>
                    <p className="mt-2 text-sm font-medium text-ink">{m.name}</p>
                    <p className="text-xs text-stone">{m.info}</p>
                    <div className="mt-3 flex flex-col gap-2">
                      <button
                        type="button"
                        className="rounded-xl border border-rose bg-white py-2 text-xs font-medium text-rose-dark hover:bg-rose-light"
                      >
                        Ver perfil
                      </button>
                      {m.role === 'mentora' ? (
                        <button
                          type="button"
                          className="rounded-xl bg-olive py-2 text-xs font-medium text-white hover:bg-olive-deep"
                        >
                          Solicitar tutoría
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {tab === 'recursos' ? (
            <div className="space-y-6">
              <section>
                <p className="mb-2 text-xs font-semibold text-olive">🌟 Destacados por la mentora</p>
                <div className="rounded-xl border border-olive-light bg-mint p-3 text-sm text-ink">
                  Guía rápida — series y sucesiones (PDF)
                </div>
              </section>
              <section>
                <p className="mb-2 text-xs font-semibold text-stone">Compartidos por el grupo</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-3 rounded-xl border border-line bg-warm p-3">
                    <span className="rounded-lg bg-blush px-2 py-2 text-xs font-bold text-rose-dark">PDF</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink">Parcial 2024 resuelto.pdf</p>
                      <p className="text-xs text-faded">Ana · 12 Abr · 1.2 MB · 34 descargas</p>
                    </div>
                    <div className="flex gap-1">
                      <button type="button" className="text-xs text-rose-dark hover:underline">
                        Ver
                      </button>
                      <button type="button" className="text-xs text-rose-dark hover:underline">
                        Descargar
                      </button>
                    </div>
                  </li>
                </ul>
              </section>
              <div className="flex flex-wrap gap-2">
                {['Todos', 'PDF', 'Presentaciones', 'Documentos', 'De la mentora'].map((c, i) => (
                  <button
                    key={c}
                    type="button"
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      i === 0 ? 'bg-ink text-white' : 'border border-rose bg-warm text-stone'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      {!loading && !error && !data ? (
        <p className="rounded-2xl border border-line bg-warm px-6 py-8 text-center text-stone">
          No se encontró la comunidad.
        </p>
      ) : null}
    </div>
  )
}
