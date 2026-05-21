import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/axios.js'
import { getErrorMessage } from '../lib/apiError.js'
import { useAuth } from '../context/AuthContext.jsx'

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

function normalizeSesionesList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.sesiones)) return data.sesiones
  if (Array.isArray(data?.data)) return data.data
  return []
}

function mapComunidad(raw) {
  return {
    id: String(raw.id ?? ''),
    nombre: raw.nombre ?? raw.name ?? 'Sin nombre',
    creadora_id: raw.creadora_id,
    es_miembro: raw.es_miembro,
  }
}

function filterMisComunidades(list, uid) {
  if (uid == null) return []
  const filtered = list.filter(
    (c) =>
      Number(c.creadora_id) === Number(uid) ||
      c.es_miembro === 1 ||
      c.es_miembro === true,
  )
  return filtered.length > 0 ? filtered : list
}

function mapSesion(raw) {
  const mentoraNombre =
    raw.mentora_nombre ??
    raw.nombre_mentora ??
    ([raw.mentora_nombre ?? raw.nombre, raw.mentora_apellido ?? raw.apellido]
      .filter(Boolean)
      .join(' ')
      .trim() || 'Mentora')
  const titulo =
    raw.titulo ?? raw.asignatura ?? `Sesión con ${mentoraNombre}`
  const fechaRaw = raw.fecha_hora ?? raw.fecha ?? raw.created_at
  let fechaLabel = '—'
  if (fechaRaw) {
    const d = new Date(fechaRaw)
    if (!Number.isNaN(d.getTime())) {
      fechaLabel = d.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    }
  }
  return {
    id: raw.id,
    mentoraNombre,
    titulo,
    fechaLabel,
  }
}

export default function MiPerfil() {
  const { user } = useAuth()
  const [comunidades, setComunidades] = useState([])
  const [sesiones, setSesiones] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const nombre = user?.nombre ?? user?.name ?? 'Estudiante'
  const email = user?.email ?? ''
  const carrera = user?.carrera ?? user?.programa ?? 'Ingeniería · Universidad'
  const inicial = (nombre || '?').trim().charAt(0).toUpperCase()
  const uid = user?.id ?? user?._id

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (uid == null) {
        setLoading(false)
        setError('No se pudo identificar al usuario autenticado.')
        return
      }

      setLoading(true)
      setError(null)
      setComunidades([])
      setSesiones([])
      setStats(null)

      try {
        const [comRes, sesRes, recRes] = await Promise.all([
          api.get('/api/comunidades'),
          api.get('/api/sesiones/estudiante'),
          api.get('/api/recursos'),
        ])
        if (cancelled) return

        const todasComunidades = normalizeComunidadesList(comRes.data).map(mapComunidad)
        const misComunidades = filterMisComunidades(todasComunidades, uid)

        const sesionesList = normalizeSesionesList(sesRes.data).map(mapSesion)

        const recursosList = normalizeRecursosList(recRes.data)
        const recursosMios = recursosList.filter(
          (r) =>
            String(r.subido_por) === String(uid) ||
            String(r.usuario_id) === String(uid),
        )

        setComunidades(misComunidades)
        setSesiones(sesionesList)
        setStats({
          comunidadesActivas: misComunidades.length,
          recursosSubidos: recursosMios.length,
          sesionesTutoria: sesionesList.length,
        })
      } catch (e) {
        if (!cancelled) {
          setError(getErrorMessage(e))
          setComunidades([])
          setSesiones([])
          setStats(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [uid])

  const comunidadesPreview = useMemo(() => comunidades.slice(0, 3), [comunidades])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-8 pb-10">
        <div className="flex min-h-[12rem] flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-warm py-12">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-rose-light border-t-rose-dark"
            role="status"
            aria-label="Cargando"
          />
          <p className="text-sm text-stone">Cargando perfil…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl space-y-8 pb-10">
        <p className="rounded-xl border border-rose bg-blush px-4 py-3 text-sm text-rose-dark">{error}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-10">
      <header className="relative rounded-2xl border border-line bg-white p-6">
        <Link
          to="/perfil/editar"
          className="absolute right-4 top-4 rounded-xl border border-rose bg-white px-3 py-1.5 text-xs font-medium text-rose-dark transition-all hover:bg-rose-light"
        >
          Editar perfil
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-rose text-2xl font-semibold text-ink">
            {inicial}
          </div>
          <div>
            <h1 className="font-display text-xl text-ink">{nombre}</h1>
            <p className="text-sm text-stone">{carrera}</p>
            {email ? <p className="mt-1 text-xs text-faded">{email}</p> : null}
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1 rounded-2xl bg-cream p-4 text-center">
          <p className="font-display text-2xl font-semibold text-rose-dark">{stats?.comunidadesActivas ?? 0}</p>
          <p className="mt-1 text-xs text-stone">Comunidades activas</p>
        </div>
        <div className="flex-1 rounded-2xl bg-cream p-4 text-center">
          <p className="font-display text-2xl font-semibold text-rose-dark">{stats?.recursosSubidos ?? 0}</p>
          <p className="mt-1 text-xs text-stone">Recursos subidos</p>
        </div>
        <div className="flex-1 rounded-2xl bg-cream p-4 text-center">
          <p className="font-display text-2xl font-semibold text-rose-dark">{stats?.sesionesTutoria ?? 0}</p>
          <p className="mt-1 text-xs text-stone">Sesiones de tutoría</p>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg text-ink">Mis Comunidades</h2>
          <Link to="/comunidades" className="text-sm font-medium text-rose-dark hover:underline">
            Ver todas →
          </Link>
        </div>
        {comunidades.length === 0 ? (
          <p className="text-sm text-stone text-center">Sin comunidades aún.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {comunidadesPreview.map((c) => (
              <div key={c.id} className="rounded-xl bg-rose-light p-3 text-center">
                <p className="text-sm font-medium text-ink">{c.nombre}</p>
                <span className="mt-2 inline-block rounded-full bg-mint px-2 py-0.5 text-xs text-olive">
                  Comunidad activa
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg text-ink">Historial de sesiones</h2>
        {sesiones.length === 0 ? (
          <p className="text-sm text-stone text-center">Sin sesiones aún.</p>
        ) : (
          <ul className="list-none p-0">
            {sesiones.map((s) => (
              <li
                key={s.id}
                className="mb-2 flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-olive text-xs font-semibold text-white">
                  {s.mentoraNombre.charAt(0).toUpperCase()}
                </div>
                <p className="flex-1 text-sm font-medium text-ink">{s.titulo}</p>
                <span className="text-xs text-faded">{s.fechaLabel}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
