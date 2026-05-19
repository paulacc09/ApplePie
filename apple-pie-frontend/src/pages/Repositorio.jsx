import { useCallback, useEffect, useMemo, useState } from 'react'
import api from '../api/axios.js'
import { getErrorMessage } from '../lib/apiError.js'
import ModalSubirRecurso from '../components/ModalSubirRecurso.jsx'

const selectClass =
  'shrink-0 rounded-xl border border-rose bg-white px-3 py-2 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-rose'

function mapRecurso(raw) {
  const tipoRaw = (raw.tipo ?? 'PDF').toString().toUpperCase()
  const vis = (raw.visibilidad ?? 'publica').toString().toLowerCase()
  return {
    id: String(raw.id ?? ''),
    nombre: raw.nombre ?? '',
    meta: [raw.asignatura, raw.semestre ? `Sem. ${raw.semestre}` : null].filter(Boolean).join(' · ') || '—',
    tipo: tipoRaw.includes('DOC') ? 'DOCX' : tipoRaw.includes('PPT') ? 'PPTX' : tipoRaw.includes('PDF') ? 'PDF' : tipoRaw,
    acceso: vis === 'publica' ? 'gratis' : 'miembros',
    url: raw.archivo_url ?? raw.url ?? '',
  }
}

function tipoIcon(tipo) {
  if (tipo === 'PDF')
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blush text-xs font-bold text-rose-dark">
        PDF
      </span>
    )
  if (tipo === 'DOCX')
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F0FE] text-xs font-bold text-[#5B7FD4]">
        DOC
      </span>
    )
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FDF3E3] text-xs font-bold text-[#D4884A]">
      PPT
    </span>
  )
}

export default function Repositorio() {
  const [query, setQuery] = useState('')
  const [asig, setAsig] = useState('')
  const [sem, setSem] = useState('')
  const [tipoF, setTipoF] = useState('')
  const [recursos, setRecursos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const fetchRecursos = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/api/recursos')
      const list = Array.isArray(data) ? data : []
      setRecursos(list.map(mapRecurso))
    } catch (e) {
      setError(getErrorMessage(e))
      setRecursos([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadInitialRecursos() {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get('/api/recursos')
        const list = Array.isArray(data) ? data : []
        if (!cancelled) setRecursos(list.map(mapRecurso))
      } catch (e) {
        if (!cancelled) {
          setError(getErrorMessage(e))
          setRecursos([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadInitialRecursos()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return recursos.filter((r) => {
      const okQ = !q || r.nombre.toLowerCase().includes(q) || r.meta.toLowerCase().includes(q)
      const okT = !tipoF || r.tipo === tipoF
      return okQ && okT
    })
  }, [recursos, query, tipoF])

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-6 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="font-display text-2xl text-ink">Repositorio</h1>
        <label htmlFor="repo-search" className="sr-only">
          Buscar recursos
        </label>
        <input
          id="repo-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar recursos..."
          className="w-full max-w-md rounded-full border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-faded shadow-sm focus:outline-none focus:ring-2 focus:ring-rose"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 pb-1">
        <select aria-label="Asignatura" value={asig} onChange={(e) => setAsig(e.target.value)} className={selectClass}>
          <option value="">Asignatura</option>
          <option>Cálculo III</option>
          <option>Álgebra</option>
          <option>Física II</option>
        </select>
        <select aria-label="Semestre" value={sem} onChange={(e) => setSem(e.target.value)} className={selectClass}>
          <option value="">Semestre</option>
          {Array.from({ length: 10 }, (_, i) => (
            <option key={i + 1} value={String(i + 1)}>
              {i + 1}
            </option>
          ))}
        </select>
        <select aria-label="Tipo" value={tipoF} onChange={(e) => setTipoF(e.target.value)} className={selectClass}>
          <option value="">Tipo</option>
          <option>PDF</option>
          <option>DOCX</option>
          <option>PPTX</option>
        </select>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-olive px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-olive-deep"
        >
          <span aria-hidden="true">
            ↑
          </span>
          Subir recurso
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-[12rem] flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-warm py-12">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-rose-light border-t-rose-dark"
            role="status"
            aria-label="Cargando"
          />
          <p className="text-sm text-stone">Cargando recursos…</p>
        </div>
      ) : null}

      {!loading && error ? (
        <p className="rounded-xl border border-rose bg-blush px-4 py-3 text-sm text-rose-dark">{error}</p>
      ) : null}

      {!loading && !error && filtered.length === 0 ? (
        <div className="rounded-2xl border border-line bg-warm py-16 text-center text-stone">
          <p className="text-4xl" aria-hidden="true">
            📭
          </p>
          <p className="mt-2 font-medium text-ink">No hay recursos disponibles</p>
        </div>
      ) : null}

      {!loading && !error && filtered.length > 0 ? (
        <ul className="list-none p-0">
          {filtered.map((r) => (
            <li
              key={r.id}
              className="mb-3 flex items-center gap-4 rounded-2xl border border-line bg-white px-5 py-4 transition-all duration-200 hover:border-rose hover:shadow-sm"
            >
              {tipoIcon(r.tipo)}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{r.nombre}</p>
                <p className="mt-0.5 text-xs text-faded">{r.meta}</p>
              </div>
              {r.acceso === 'gratis' ? (
                <span className="shrink-0 rounded-full bg-mint px-2 py-0.5 text-xs font-medium text-olive">
                  Gratis
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-rose-light px-2 py-0.5 text-xs font-medium text-rose-dark">
                  Solo miembros
                </span>
              )}
              <button
                type="button"
                className="shrink-0 text-sm font-medium text-rose-dark hover:underline"
                disabled={!r.url}
                onClick={() => {
                  if (r.url) window.open(r.url, '_blank', 'noopener,noreferrer')
                }}
              >
                Descargar
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <ModalSubirRecurso
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onUploaded={fetchRecursos}
      />
    </div>
  )
}
