import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../api/axios.js'
import ModalSubirRecurso from '../components/ModalSubirRecurso.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getErrorMessage } from '../lib/apiError.js'

function extensionFrom(nombre, url) {
  const source = nombre || url || ''
  const match = source.match(/\.([a-z0-9]+)(?:\?|$)/i)
  return match ? match[1].toLowerCase() : ''
}

function tipoFromExtension(ext) {
  if (ext === 'pdf') return 'PDF'
  if (ext === 'doc' || ext === 'docx') return 'DOCX'
  if (ext === 'ppt' || ext === 'pptx') return 'PPTX'
  return 'PDF'
}

function tipoFromRecurso(raw) {
  const ext = extensionFrom(raw.nombre, raw.archivo_url ?? raw.url)
  const tipoApi = (raw.tipo ?? '').toString().toUpperCase()
  if (tipoApi.includes('DOC')) return 'DOCX'
  if (tipoApi.includes('PPT')) return 'PPTX'
  if (tipoApi.includes('PDF')) return 'PDF'
  return tipoFromExtension(ext)
}

function formatSubido(createdAt) {
  if (!createdAt) return '—'
  const d = new Date(createdAt)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
}

function isPublico(raw) {
  if (raw.publico === true || raw.publico === 1) return true
  if (raw.publico === false || raw.publico === 0) return false
  return (raw.visibilidad ?? '').toString().toLowerCase() === 'publica'
}

function mapMaterial(raw) {
  const publico = isPublico(raw)
  return {
    id: String(raw.id ?? raw.nombre),
    nombre: raw.nombre ?? '—',
    asig: raw.asignatura ?? '—',
    tipo: tipoFromRecurso(raw),
    subido: formatSubido(raw.created_at),
    compartido: publico ? 'publico' : 'sesiones',
  }
}

function tipoBadge(t) {
  if (t === 'PDF')
    return <span className="rounded bg-blush px-2 py-0.5 text-xs font-bold text-rose-dark">PDF</span>
  if (t === 'DOCX')
    return <span className="rounded bg-[#E8F0FE] px-2 py-0.5 text-xs font-bold text-[#5B7FD4]">DOCX</span>
  return <span className="rounded bg-[#FDF3E3] px-2 py-0.5 text-xs font-bold text-[#D4884A]">PPTX</span>
}

export default function MaterialesMentora() {
  const { user } = useAuth()
  const [recursos, setRecursos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [asig, setAsig] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)

  const asignaturasOptions = useMemo(() => {
    const s = new Set()
    for (const r of recursos) {
      const a = String(r.asig ?? '').trim()
      if (a && a !== '—') s.add(a)
    }
    return ['', ...Array.from(s).sort()]
  }, [recursos])

  const filtrados = useMemo(() => {
    if (!asig) return recursos
    return recursos.filter((r) => r.asig === asig)
  }, [recursos, asig])

  const fetchRecursos = useCallback(async () => {
    const uid = user?.id ?? user?._id
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/api/recursos')
      const list = Array.isArray(data) ? data : []
      const mine = uid != null ? list.filter((r) => String(r.subido_por) === String(uid)) : []
      setRecursos(mine.map(mapMaterial))
    } catch (e) {
      setError(getErrorMessage(e))
      setRecursos([])
    } finally {
      setLoading(false)
    }
  }, [user?.id, user?._id])

  useEffect(() => {
    fetchRecursos()
  }, [fetchRecursos])

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <div>
        <h1 className="font-display text-2xl text-ink">Mis materiales de apoyo</h1>
        <p className="mt-1 text-sm text-stone">
          Recursos que usas en tus sesiones. Puedes compartirlos con el repositorio general.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          aria-label="Asignatura"
          value={asig}
          onChange={(e) => setAsig(e.target.value)}
          className="rounded-xl border border-rose bg-white px-3 py-2 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-rose"
        >
          <option value="">Todas las asignaturas</option>
          {asignaturasOptions.filter(Boolean).map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setModalAbierto(true)}
          className="inline-flex items-center gap-1 rounded-xl bg-olive px-4 py-2 text-sm font-medium text-white hover:bg-olive-deep"
        >
          + Subir material
        </button>
      </div>

      {loading ? (
        <p className="rounded-2xl border border-line bg-warm px-6 py-10 text-center text-sm text-stone">
          Cargando materiales…
        </p>
      ) : null}

      {!loading && error ? (
        <p className="rounded-xl border border-rose bg-blush px-4 py-3 text-sm text-rose-dark">{error}</p>
      ) : null}

      {!loading && !error && recursos.length === 0 ? (
        <p className="rounded-2xl border border-line bg-warm px-6 py-10 text-center text-sm text-stone">
          Aún no has subido materiales.
        </p>
      ) : null}

      {!loading && !error && recursos.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-cream">
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-stone">Nombre</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-stone">Asignatura</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-stone">Tipo</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-stone">Subido</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-stone">Compartido</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-stone">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-stone">
                    No hay materiales para esta asignatura.
                  </td>
                </tr>
              ) : (
                filtrados.map((r) => (
                  <tr key={r.id} className="border-b border-cream-2 transition-colors hover:bg-[#FAFAF8]">
                    <td className="px-5 py-4 text-sm text-ink">{r.nombre}</td>
                    <td className="px-5 py-4 text-sm text-ink">{r.asig}</td>
                    <td className="px-5 py-4">{tipoBadge(r.tipo)}</td>
                    <td className="px-5 py-4 text-sm text-ink">{r.subido}</td>
                    <td className="px-5 py-4">
                      {r.compartido === 'publico' ? (
                        <span className="rounded-full bg-mint px-2 py-0.5 text-xs text-olive">Público</span>
                      ) : (
                        <span className="rounded-full bg-rose-light px-2 py-0.5 text-xs text-rose-dark">Solo sesiones</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <button type="button" className="text-xs font-medium text-rose-dark hover:underline">
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      <ModalSubirRecurso
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onUploaded={fetchRecursos}
      />
    </div>
  )
}
