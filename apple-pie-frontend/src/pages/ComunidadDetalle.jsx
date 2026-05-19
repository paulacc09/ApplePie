import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import LogoApplePie from '../components/LogoApplePie.jsx'
import ModalSubirRecurso from '../components/ModalSubirRecurso.jsx'
import { api } from '../api/axios.js'
import { getErrorMessage } from '../lib/apiError.js'

const EVENTO_INICIAL = {
  nombre: '',
  descripcion: '',
  fecha: '',
  hora: '',
  modalidad: 'virtual',
  capacidad_max: 30,
}

function generarLinkCalendar(nombre, fecha, hora, descripcion) {
  const fechaHoraLocal = new Date(`${fecha}T${hora}:00`)
  const pad = (n) => String(n).padStart(2, '0')
  const formatGCal = (d) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `T${pad(d.getHours())}${pad(d.getMinutes())}00`
  const fechaFin = new Date(fechaHoraLocal.getTime() + 60 * 60 * 1000)

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: nombre,
    dates: `${formatGCal(fechaHoraLocal)}/${formatGCal(fechaFin)}`,
    details: descripcion || 'Evento de comunidad Apple Pie',
    add: '',
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}&vcon=meet`
}

function avatarBg(role) {
  if (role === 'mentora') return 'bg-olive'
  if (role === 'moderadora') return 'bg-rose'
  if (role === 'creadora') return 'bg-olive'
  return 'bg-faded'
}

function normalizeForoList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.publicaciones)) return data.publicaciones
  if (Array.isArray(data?.data)) return data.data
  return []
}

function mapPost(raw) {
  const repliesRaw = raw.respuestas ?? []
  const replies = Array.isArray(repliesRaw)
    ? repliesRaw.map((rep) => ({
        name: rep.name ?? rep.nombre ?? rep.autor_nombre ?? 'Usuario',
        text: rep.text ?? rep.contenido ?? rep.texto ?? '',
      }))
    : []

  return {
    id: raw.id,
    name: raw.autor_nombre ?? raw.nombre ?? 'Usuario',
    handle: `@${raw.autor_username ?? raw.autor_id ?? ''}`,
    time: raw.created_at ?? '',
    text: raw.contenido ?? raw.texto ?? '',
    replies,
  }
}

function normalizeMembersList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.miembros)) return data.miembros
  if (Array.isArray(data?.data)) return data.data
  return []
}

function mapMember(raw) {
  const nombre = [raw.nombre, raw.apellido].filter(Boolean).join(' ').trim()
  return {
    id: raw.id,
    name: nombre || raw.name || 'Usuario',
    role: raw.rol ?? raw.role ?? 'estudiante',
    info: (raw.carrera ?? '') + (raw.semestre ? ` · ${raw.semestre}vo` : ''),
    mentora_id: raw.mentora_id ?? null,
    usuario_id: raw.usuario_id ?? raw.id,
  }
}

function normalizeRecursosList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.recursos)) return data.recursos
  if (Array.isArray(data?.data)) return data.data
  return []
}

function mapRecurso(raw) {
  const tipo = (raw.tipo ?? 'PDF').toString().toUpperCase()
  return {
    id: raw.id,
    nombre: raw.nombre ?? raw.titulo ?? '',
    tipo,
    autor: raw.autor_nombre ?? raw.subido_por ?? '',
    fecha: raw.created_at ?? '',
    url: raw.url ?? raw.archivo_url ?? null,
    destacado: raw.destacado ?? false,
  }
}

function normalizeEventosList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.eventos)) return data.eventos
  if (Array.isArray(data?.data)) return data.data
  return []
}

export default function ComunidadDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('foro')
  const [roleFilter, setRoleFilter] = useState('todos')

  const [posts, setPosts] = useState([])
  const [members, setMembers] = useState([])
  const [recursos, setRecursos] = useState([])
  const [postText, setPostText] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [resourceFilter, setResourceFilter] = useState('Todos')
  const [showModalRecurso, setShowModalRecurso] = useState(false)
  const [eventos, setEventos] = useState([])
  const [showModalEvento, setShowModalEvento] = useState(false)
  const [eventoForm, setEventoForm] = useState(EVENTO_INICIAL)
  const [creandoEvento, setCreandoEvento] = useState(false)
  const [eventoError, setEventoError] = useState('')
  const [eventoSuccess, setEventoSuccess] = useState('')

  const recargarRecursosGrupo = useCallback(async () => {
    if (!id) return
    try {
      const { data } = await api.get(`/api/recursos?comunidad_id=${id}`)
      setRecursos(normalizeRecursosList(data).map(mapRecurso))
    } catch {
      setRecursos([])
    }
  }, [id])

  const cargarEventos = useCallback(async () => {
    if (!id) return
    try {
      const { data } = await api.get(`/api/comunidades/${id}/eventos`)
      setEventos(normalizeEventosList(data))
    } catch (err) {
      console.error('Error cargando eventos:', err)
      setEventos([])
    }
  }, [id])

  useEffect(() => {
    if (!id) return undefined
    let cancelled = false

    async function loadEventos() {
      try {
        const { data } = await api.get(`/api/comunidades/${id}/eventos`)
        if (!cancelled) setEventos(normalizeEventosList(data))
      } catch (err) {
        console.error('Error cargando eventos:', err)
        if (!cancelled) setEventos([])
      }
    }

    loadEventos()
    return () => {
      cancelled = true
    }
  }, [id])

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

  useEffect(() => {
    if (!id) return
    let cancelled = false

    async function loadTab() {
      if (tab === 'foro') {
        try {
          const { data } = await api.get(`/api/comunidades/${id}/foro`)
          if (!cancelled) setPosts(normalizeForoList(data).map(mapPost))
        } catch {
          if (!cancelled) setPosts([])
        }
        return
      }
      if (tab === 'miembros') {
        try {
          const { data } = await api.get(`/api/comunidades/${id}/miembros`)
          if (!cancelled) setMembers(normalizeMembersList(data).map(mapMember))
        } catch {
          if (!cancelled) setMembers([])
        }
        return
      }
      if (tab === 'recursos') {
        try {
          const { data } = await api.get(`/api/recursos?comunidad_id=${id}`)
          if (!cancelled) setRecursos(normalizeRecursosList(data).map(mapRecurso))
        } catch {
          if (!cancelled) setRecursos([])
        }
        return
      }
    }

    loadTab()
    return () => {
      cancelled = true
    }
  }, [tab, id])

  const nombre = data?.nombre ?? data?.name ?? 'Cálculo III – Grupo A'
  const materia = data?.materia ?? data?.subject ?? ''

  const membersShown =
    roleFilter === 'todos' ? members : members.filter((m) => m.role === roleFilter)

  const destacados = recursos.filter((r) => r.destacado)
  const compartidosBase = recursos.filter((r) => !r.destacado)
  const compartidosFiltered = compartidosBase.filter((r) => {
    if (resourceFilter === 'Todos') return true
    if (resourceFilter === 'PDF') return r.tipo === 'PDF'
    if (resourceFilter === 'Presentaciones') return r.tipo === 'PPT' || r.tipo === 'PPTX'
    if (resourceFilter === 'Documentos') return r.tipo === 'DOC' || r.tipo === 'DOCX'
    if (resourceFilter === 'De la mentora') return r.destacado === true
    return true
  })

  async function handlePublicar() {
    const text = postText.trim()
    if (!text || !id) return
    setPublishing(true)
    try {
      await api.post(`/api/comunidades/${id}/foro`, { contenido: text })
      setPostText('')
      const { data } = await api.get(`/api/comunidades/${id}/foro`)
      setPosts(normalizeForoList(data).map(mapPost))
    } catch (e) {
      window.alert(getErrorMessage(e))
    } finally {
      setPublishing(false)
    }
  }

  function abrirModalEvento() {
    setEventoForm(EVENTO_INICIAL)
    setEventoError('')
    setEventoSuccess('')
    setShowModalEvento(true)
  }

  function cerrarModalEvento() {
    if (creandoEvento) return
    setShowModalEvento(false)
    setEventoError('')
  }

  async function handleCrearEvento(e) {
    e.preventDefault()
    if (!id) return
    setEventoError('')
    setEventoSuccess('')

    if (!eventoForm.nombre.trim() || !eventoForm.fecha || !eventoForm.hora) {
      setEventoError('Completa nombre, fecha y hora.')
      return
    }

    setCreandoEvento(true)
    try {
      const modalidad = eventoForm.modalidad || 'virtual'
      const descripcion = eventoForm.descripcion.trim()
      const body = {
        nombre: eventoForm.nombre.trim(),
        descripcion,
        fecha: eventoForm.fecha,
        hora: eventoForm.hora,
        modalidad,
        capacidad_max: Number(eventoForm.capacidad_max) || 30,
        meet_link: null,
      }
      await api.post(`/api/comunidades/${id}/eventos`, body)
      await cargarEventos()
      setShowModalEvento(false)
      setEventoForm(EVENTO_INICIAL)
      setEventoSuccess('Evento creado correctamente.')

      if (modalidad !== 'presencial') {
        const linkCal = generarLinkCalendar(body.nombre, body.fecha, body.hora, descripcion)
        window.open(linkCal, '_blank', 'noopener,noreferrer')
      }
    } catch (e) {
      setEventoError(getErrorMessage(e))
    } finally {
      setCreandoEvento(false)
    }
  }

  function cerrarModalRecursoYRecargar() {
    setShowModalRecurso(false)
    void recargarRecursosGrupo()
  }

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
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                />
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-faded">📎 Adjuntar archivo</span>
                  <button
                    type="button"
                    onClick={handlePublicar}
                    disabled={publishing || !postText.trim()}
                    className="rounded-xl bg-rose px-4 py-2 text-xs font-medium text-ink shadow-sm hover:bg-rose-dark"
                  >
                    Publicar
                  </button>
                </div>
              </div>

              {posts.length === 0 ? (
                <p className="rounded-2xl border border-line bg-warm p-4 text-center text-sm text-stone shadow-card">
                  No hay publicaciones aún
                </p>
              ) : null}

              {posts.map((p) => (
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
                          {p.replies.map((r, idx) => (
                            <p key={`${r.text}-${idx}`} className="text-sm text-stone">
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
              {eventoSuccess ? (
                <p className="mt-3 rounded-xl border border-olive-light bg-mint px-3 py-2 text-sm text-olive">
                  {eventoSuccess}
                </p>
              ) : null}
              <div className="mt-2 space-y-2">
                {eventos.length === 0 ? (
                  <p className="py-4 text-center text-sm text-stone">
                    No hay eventos registrados para esta comunidad.
                  </p>
                ) : (
                  eventos.map((evento) => {
                    const rawFecha = evento.fecha
                    const fechaStr = rawFecha ? String(rawFecha) : ''
                    const fechaFmt =
                      fechaStr.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(fechaStr)
                        ? new Date(`${fechaStr.slice(0, 10)}T00:00:00`).toLocaleDateString('es-CO', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : rawFecha
                          ? new Date(rawFecha).toLocaleDateString('es-CO', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'
                    const mod = String(evento.modalidad ?? '').toLowerCase()
                    return (
                      <div key={evento.id} className="mb-2 rounded-xl bg-blush/30 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-ink">{evento.nombre}</p>
                            <p className="text-xs text-stone">
                              {fechaFmt} · {evento.hora ?? '—'}
                            </p>
                            <span className="text-xs text-rose-dark">
                              {mod === 'virtual' ? '🎥 Virtual' : '📍 Presencial'}
                            </span>
                          </div>
                          {evento.meet_link ? (
                            <a
                              href={evento.meet_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 rounded-lg bg-olive px-2 py-1 text-xs text-white hover:opacity-80"
                            >
                              Unirse →
                            </a>
                          ) : mod !== 'presencial' ? (
                            <a
                              href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(evento.nombre)}&vcon=meet`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 rounded-lg bg-gray-300 px-2 py-1 text-xs text-gray-600 hover:opacity-80"
                            >
                              Programar →
                            </a>
                          ) : null}
                        </div>
                        {evento.descripcion ? (
                          <p className="mt-1 text-xs text-stone">{evento.descripcion}</p>
                        ) : null}
                      </div>
                    )
                  })
                )}
              </div>
              <button
                type="button"
                onClick={abrirModalEvento}
                className="mt-6 w-full rounded-xl bg-rose px-5 py-2 text-sm font-medium text-ink shadow-sm hover:bg-rose-dark"
              >
                CREAR EVENTO
              </button>
            </div>
          ) : null}

          {tab === 'miembros' ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {['todos', 'creadora', 'mentora', 'moderadora', 'estudiante'].map((r) => (
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
                    key={m.id}
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
                        onClick={() =>
                          m.mentora_id != null
                            ? navigate(`/mentoria/${m.mentora_id}`)
                            : navigate('/perfil')
                        }
                        className="rounded-xl border border-rose bg-white py-2 text-xs font-medium text-rose-dark hover:bg-rose-light"
                      >
                        Ver perfil
                      </button>
                      {m.role === 'mentora' && m.mentora_id != null ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/mentoria/${m.mentora_id}`)}
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
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-ink">Recursos del grupo</p>
                <button
                  type="button"
                  onClick={() => setShowModalRecurso(true)}
                  className="rounded-xl bg-rose px-4 py-2 text-xs font-medium text-ink shadow-sm hover:bg-rose-dark"
                >
                  ↑ Subir recurso
                </button>
              </div>
              <section>
                <p className="mb-2 text-xs font-semibold text-olive">🌟 Destacados por la mentora</p>
                {destacados.length === 0 ? (
                  <div className="rounded-xl border border-olive-light bg-mint p-3 text-sm text-stone">Sin recursos destacados</div>
                ) : (
                  <div className="space-y-2">
                    {destacados.map((r) => (
                      <div key={r.id} className="rounded-xl border border-olive-light bg-mint p-3 text-sm text-ink">
                        {r.nombre} ({r.tipo})
                      </div>
                    ))}
                  </div>
                )}
              </section>
              <section>
                <p className="mb-2 text-xs font-semibold text-stone">Compartidos por el grupo</p>
                <ul className="space-y-2">
                  {compartidosFiltered.length === 0 ? (
                    <li className="rounded-xl border border-line bg-warm p-3 text-center text-sm text-stone">
                      Sin recursos compartidos
                    </li>
                  ) : (
                    compartidosFiltered.map((r) => (
                      <li key={r.id} className="flex items-center gap-3 rounded-xl border border-line bg-warm p-3">
                        <span className="rounded-lg bg-blush px-2 py-2 text-xs font-bold text-rose-dark">{r.tipo}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-ink">{r.nombre}</p>
                          <p className="text-xs text-faded">
                            {r.autor} · {r.fecha}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            className="text-xs text-rose-dark hover:underline"
                            onClick={() => {
                              if (r.url) window.open(r.url, '_blank', 'noopener,noreferrer')
                            }}
                          >
                            Ver
                          </button>
                          <button
                            type="button"
                            className="text-xs text-rose-dark hover:underline"
                            onClick={() => {
                              if (r.url) window.open(r.url, '_blank', 'noopener,noreferrer')
                            }}
                          >
                            Descargar
                          </button>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </section>
              <div className="flex flex-wrap gap-2">
                {['Todos', 'PDF', 'Presentaciones', 'Documentos', 'De la mentora'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setResourceFilter(c)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      resourceFilter === c ? 'bg-ink text-white' : 'border border-rose bg-warm text-stone'
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

      {showModalEvento ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl border border-line bg-cream p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-display text-lg text-ink">Crear nuevo evento</h2>
              <button
                type="button"
                onClick={cerrarModalEvento}
                disabled={creandoEvento}
                className="text-sm text-faded transition-colors hover:text-rose-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                ✕
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleCrearEvento}>
              <label className="block text-sm font-medium text-ink">
                Nombre
                <input
                  type="text"
                  required
                  value={eventoForm.nombre}
                  onChange={(e) => setEventoForm((f) => ({ ...f, nombre: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-rose bg-white px-4 py-3 text-ink placeholder:text-faded transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose"
                  placeholder="Título del evento"
                />
              </label>

              <label className="block text-sm font-medium text-ink">
                Descripción
                <textarea
                  rows={3}
                  value={eventoForm.descripcion}
                  onChange={(e) => setEventoForm((f) => ({ ...f, descripcion: e.target.value }))}
                  className="mt-1 w-full resize-none rounded-xl border border-rose bg-white px-4 py-3 text-ink placeholder:text-faded transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose"
                  placeholder="Detalles opcionales"
                />
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block text-sm font-medium text-ink">
                  Fecha
                  <input
                    type="date"
                    required
                    value={eventoForm.fecha}
                    onChange={(e) => setEventoForm((f) => ({ ...f, fecha: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-rose bg-white px-4 py-3 text-ink transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose"
                  />
                </label>

                <label className="block text-sm font-medium text-ink">
                  Hora
                  <input
                    type="time"
                    required
                    value={eventoForm.hora}
                    onChange={(e) => setEventoForm((f) => ({ ...f, hora: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-rose bg-white px-4 py-3 text-ink transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block text-sm font-medium text-ink">
                  Modalidad
                  <select
                    value={eventoForm.modalidad}
                    onChange={(e) => setEventoForm((f) => ({ ...f, modalidad: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-rose bg-white px-4 py-3 text-ink transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose"
                  >
                    <option value="virtual">Virtual</option>
                    <option value="presencial">Presencial</option>
                  </select>
                </label>

                <label className="block text-sm font-medium text-ink">
                  Capacidad
                  <input
                    type="number"
                    min="1"
                    value={eventoForm.capacidad_max}
                    onChange={(e) => setEventoForm((f) => ({ ...f, capacidad_max: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-rose bg-white px-4 py-3 text-ink transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose"
                  />
                </label>
              </div>

              {eventoForm.modalidad !== 'presencial' ? (
                <p className="rounded-lg bg-blush/20 px-3 py-2 text-xs text-faded">
                  📅 Al crear el evento se abrirá Google Calendar para programarlo con un link de Meet y
                  recordatorio automático.
                </p>
              ) : null}

              {eventoError ? (
                <p className="rounded-xl border border-rose bg-blush px-4 py-3 text-sm text-rose-dark">
                  {eventoError}
                </p>
              ) : null}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={cerrarModalEvento}
                  disabled={creandoEvento}
                  className="rounded-xl border border-rose bg-white px-4 py-2 text-sm font-medium text-rose-dark hover:bg-rose-light disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creandoEvento}
                  className="rounded-xl bg-rose px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-rose-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creandoEvento ? 'Creando...' : 'Crear evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <ModalSubirRecurso
        open={showModalRecurso}
        onClose={cerrarModalRecursoYRecargar}
        onUploaded={recargarRecursosGrupo}
        comunidadId={id}
      />
    </div>
  )
}
