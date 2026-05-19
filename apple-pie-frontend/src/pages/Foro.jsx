import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/axios.js'

function normalizeForoList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.publicaciones)) return data.publicaciones
  if (Array.isArray(data?.posts)) return data.posts
  if (Array.isArray(data?.data)) return data.data
  return []
}

function mapPost(raw) {
  const autor = [raw.autor_nombre, raw.autor_apellido].filter(Boolean).join(' ').trim()
  return {
    id: raw.id,
    name: autor || raw.nombre || 'Usuario',
    handle: '@' + (raw.autor_username ?? raw.autor_id ?? ''),
    time: raw.created_at ?? '',
    text: raw.contenido ?? raw.texto ?? '',
    me_gusta: Number(raw.me_gusta ?? 0),
    replies: Array.isArray(raw.replies) ? raw.replies : [],
  }
}

function mapReply(raw) {
  const autor = [raw.autor_nombre, raw.autor_apellido, raw.nombre, raw.apellido].filter(Boolean).join(' ').trim()
  return {
    id: raw.id,
    name: autor || 'Usuario',
    text: raw.contenido ?? raw.texto ?? '',
    time: raw.created_at ?? '',
  }
}

export default function Foro() {
  const [posts, setPosts] = useState([])
  const [postText, setPostText] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [respondiendo, setRespondiendo] = useState({})

  const loadPosts = useCallback(async (opts = { withSkeleton: true }) => {
    if (opts.withSkeleton) {
      setLoading(true)
      setError('')
    }
    try {
      const { data } = await api.get('/api/foro')
      if (!Array.isArray(data)) {
        console.error('Respuesta inesperada:', data)
        setPosts([])
        setError('')
        return
      }
      setPosts(normalizeForoList(data).map(mapPost))
      setError('')
    } catch (e) {
      console.error('Error cargando publicaciones:', e)
      setError('No se pudieron cargar las publicaciones. Intenta de nuevo.')
      setPosts([])
    } finally {
      if (opts.withSkeleton) setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadInitialPosts() {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get('/api/foro')
        if (!Array.isArray(data)) {
          console.error('Respuesta inesperada:', data)
          if (!cancelled) setPosts([])
          return
        }
        if (!cancelled) {
          setPosts(normalizeForoList(data).map(mapPost))
          setError('')
        }
      } catch (e) {
        console.error('Error cargando publicaciones:', e)
        if (!cancelled) {
          setError('No se pudieron cargar las publicaciones. Intenta de nuevo.')
          setPosts([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadInitialPosts()
    return () => {
      cancelled = true
    }
  }, [])

  async function handlePublicar() {
    const text = postText.trim()
    if (!text) return
    setPublishing(true)
    try {
      await api.post('/api/foro', { contenido: text })
      setPostText('')
      await loadPosts({ withSkeleton: false })
    } catch (e) {
      console.error('Error creando publicación:', e)
      setError('No se pudo crear la publicación. Intenta de nuevo.')
    } finally {
      setPublishing(false)
    }
  }

  async function cargarRespuestas(postId) {
    try {
      const { data } = await api.get(`/api/foro/${postId}/respuestas`)
      const replies = Array.isArray(data) ? data.map(mapReply) : []
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, replies } : p)))
    } catch (e) {
      console.error('Error cargando respuestas:', e)
    }
  }

  async function handleMeGusta(postId) {
    try {
      await api.post(`/api/foro/${postId}/me-gusta`)
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, me_gusta: p.me_gusta + 1 } : p)))
    } catch (e) {
      console.error('Error al dar me gusta:', e)
    }
  }

  async function handleResponder(postId) {
    const contenido = respondiendo[postId]
    if (!contenido?.trim()) return

    try {
      await api.post(`/api/foro/${postId}/respuestas`, { contenido })
      setRespondiendo((prev) => ({ ...prev, [postId]: '' }))
      await cargarRespuestas(postId)
    } catch (e) {
      console.error('Error al responder:', e)
    }
  }

  function toggleResponder(postId) {
    if (respondiendo[postId] !== undefined) {
      setRespondiendo((prev) => {
        const next = { ...prev }
        delete next[postId]
        return next
      })
      return
    }

    setRespondiendo((prev) => ({ ...prev, [postId]: '' }))
    void cargarRespuestas(postId)
  }

  return (
    <div className="mx-auto w-full max-w-4xl rounded-2xl border border-line bg-warm px-6 py-6 shadow-card">
      <header className="mb-6">
        <h1 className="font-display text-2xl text-ink">Foro global</h1>
        <p className="mt-3 text-sm leading-relaxed text-stone">
          Publicaciones de toda la comunidad Apple Pie.
        </p>
      </header>

      {loading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-cream-2" aria-busy="true" />
      ) : null}

      {!loading && error ? (
        <p className="mb-4 rounded-2xl border border-rose bg-blush px-4 py-3 text-sm text-rose-dark">{error}</p>
      ) : null}

      {!loading ? (
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

          {!loading && !error && posts.length === 0 ? (
            <p className="rounded-2xl border border-line bg-warm p-4 text-center text-sm text-stone shadow-card">
              No hay publicaciones aún.
            </p>
          ) : null}

          {posts.map((p, idx) => (
            <article key={p.id != null ? String(p.id) : `post-${idx}`} className="rounded-2xl border border-line bg-warm p-4 shadow-card">
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
                    <button type="button" className="hover:text-rose-dark" onClick={() => toggleResponder(p.id)}>
                      💬 Responder
                    </button>
                    <button type="button" className="hover:text-rose-dark" onClick={() => handleMeGusta(p.id)}>
                      🤍 Me gusta {p.me_gusta > 0 ? `(${p.me_gusta})` : ''}
                    </button>
                  </div>
                  {respondiendo[p.id] !== undefined ? (
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                      <textarea
                        className="flex-1 resize-none rounded-lg border border-rose bg-white px-3 py-2 text-sm text-ink placeholder:text-faded focus:outline-none focus:ring-2 focus:ring-rose"
                        rows={2}
                        placeholder="Escribe tu respuesta..."
                        value={respondiendo[p.id]}
                        onChange={(e) =>
                          setRespondiendo((prev) => ({ ...prev, [p.id]: e.target.value }))
                        }
                      />
                      <button
                        type="button"
                        onClick={() => handleResponder(p.id)}
                        className="rounded-lg bg-rose px-4 py-2 text-sm font-medium text-white hover:bg-rose-dark"
                      >
                        Enviar
                      </button>
                    </div>
                  ) : null}
                  {p.replies?.length ? (
                    <div className="ml-2 mt-3 border-l-2 border-line pl-3">
                      {p.replies.map((r, idx) => (
                        <p key={r.id ?? `${r.text}-${idx}`} className="text-sm text-stone">
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
    </div>
  )
}
