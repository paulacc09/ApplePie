import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/axios.js'
import { getErrorMessage } from '../lib/apiError.js'
import { useAuth } from '../context/AuthContext.jsx'

const EMOJIS = ['🔬', '📐', '💻', '📊']

function careerEmoji(asignatura) {
  if (!asignatura) return '💻'
  let h = 0
  for (let i = 0; i < asignatura.length; i += 1) {
    h = (h + asignatura.charCodeAt(i) * 13) % 997
  }
  return EMOJIS[h % EMOJIS.length]
}

function normalizeComunidadesList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.comunidades)) return data.comunidades
  if (Array.isArray(data?.data)) return data.data
  return []
}

function normalizeRecursosList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.recursos)) return data.recursos
  if (Array.isArray(data?.data)) return data.data
  return []
}

function mapComunidadHome(raw) {
  return {
    id: String(raw.id ?? ''),
    nombre: raw.nombre ?? 'Sin nombre',
    asignatura: raw.asignatura ?? raw.materia ?? '',
  }
}

function mapRecursoHome(raw) {
  return {
    id: String(raw.id ?? ''),
    nombre: raw.nombre ?? raw.titulo ?? 'Sin nombre',
    tipo: raw.tipo ?? 'PDF',
    subido_por: raw.subido_por ?? raw.autor ?? '',
    fecha: raw.created_at ?? raw.fecha ?? '',
  }
}

function tipoBadgeLabel(tipo) {
  const t = String(tipo ?? 'PDF').toUpperCase()
  if (t.includes('DOC')) return 'DOC'
  if (t.includes('PPT')) return 'PPT'
  if (t.includes('PDF')) return 'PDF'
  return t.slice(0, 3) || 'PDF'
}

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const nombre = user?.nombre ?? user?.name ?? 'estudiante'
  const [comunidades, setComunidades] = useState([])
  const [recursos, setRecursos] = useState([])

  useEffect(() => {
    let cancelled = false

    async function loadComunidades() {
      try {
        const { data } = await api.get('/api/comunidades')
        if (cancelled) return
        setComunidades(normalizeComunidadesList(data).map(mapComunidadHome))
      } catch (e) {
        if (!cancelled) {
          void getErrorMessage(e)
          setComunidades([])
        }
      }
    }

    async function loadRecursos() {
      try {
        const { data } = await api.get('/api/recursos')
        if (cancelled) return
        setRecursos(normalizeRecursosList(data).map(mapRecursoHome))
      } catch (e) {
        if (!cancelled) {
          void getErrorMessage(e)
          setRecursos([])
        }
      }
    }

    loadComunidades()
    loadRecursos()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mx-auto max-w-3xl space-y-8 md:max-w-5xl">
      <div className="md:hidden">
        <label htmlFor="home-search" className="sr-only">
          Buscar
        </label>
        <input
          id="home-search"
          type="search"
          placeholder="Buscar comunidades, recursos..."
          className="w-full rounded-full border border-line bg-warm px-4 py-2.5 text-sm text-ink shadow-card placeholder:text-faded"
        />
      </div>

      <header>
        <h1 className="font-display text-2xl text-ink md:text-3xl">
          Hola, {nombre} 👋
        </h1>
        <p className="mt-1 text-sm text-stone">¿Qué quieres aprender hoy?</p>
      </header>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg text-ink">Mis Comunidades</h2>
          <Link to="/comunidades" className="text-sm font-medium text-rose-dark hover:underline">
            Ver todas →
          </Link>
        </div>
        <div className="-mx-4 flex gap-3 overflow-x-auto pb-2 px-4 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
          {comunidades.map((c) => (
            <article
              key={c.id || c.nombre}
              className="min-w-[160px] shrink-0 rounded-2xl bg-rose-light p-4 shadow-card"
            >
              <div className="text-2xl" aria-hidden="true">
                {careerEmoji(c.asignatura)}
              </div>
              <p className="mt-2 text-sm font-medium text-ink">{c.nombre}</p>
              <p className="text-xs text-stone">{c.asignatura}</p>
            </article>
          ))}
          <button
            type="button"
            onClick={() => navigate('/comunidades')}
            className="flex min-w-[160px] shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-rose bg-warm p-4 text-center shadow-card"
          >
            <span className="text-2xl text-rose" aria-hidden="true">
              +
            </span>
            <span className="mt-2 text-sm text-rose-dark">Crear comunidad</span>
          </button>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg text-ink">Recursos Recientes</h2>
        <ul className="space-y-2">
          {recursos.map((r) => (
            <li
              key={r.id || r.nombre}
              className="flex items-center gap-3 rounded-xl bg-warm p-3 shadow-card"
            >
              <span className="rounded-lg bg-blush px-2 py-2 text-xs font-bold text-rose-dark">
                {tipoBadgeLabel(r.tipo)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{r.nombre}</p>
                <p className="text-xs text-faded">
                  Subido por {r.subido_por} · {r.fecha}
                </p>
              </div>
              <button type="button" className="text-xs font-medium text-rose-dark hover:underline">
                Descargar
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
