import { useEffect, useMemo, useState } from 'react'
import ModalSubirRecurso from '../components/ModalSubirRecurso.jsx'

const selectClass =
  'shrink-0 rounded-xl border border-rose bg-white px-3 py-2 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-rose'

const MOCK = [
  {
    id: '1',
    nombre: 'Guía integrales — Parcial 2.pdf',
    meta: 'Cálculo III · Subido por @maria',
    tipo: 'PDF',
    acceso: 'gratis',
  },
  {
    id: '2',
    nombre: 'Apuntes Álgebra lineal.docx',
    meta: 'Álgebra · Subido por @laura',
    tipo: 'DOCX',
    acceso: 'miembros',
  },
  {
    id: '3',
    nombre: 'Presentación ondas.pptx',
    meta: 'Física II · Subido por @camila',
    tipo: 'PPTX',
    acceso: 'gratis',
  },
]

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
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 600)
    return () => window.clearTimeout(t)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return MOCK.filter((r) => {
      const okQ = !q || r.nombre.toLowerCase().includes(q) || r.meta.toLowerCase().includes(q)
      const okT = !tipoF || r.tipo === tipoF
      return okQ && okT
    })
  }, [query, tipoF])

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-8">
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

      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
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
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-cream-2" aria-hidden="true" />
          ))}
        </div>
      ) : null}

      {!loading && filtered.length === 0 ? (
        <div className="rounded-2xl border border-line bg-warm py-16 text-center text-stone">
          <p className="text-4xl" aria-hidden="true">
            📭
          </p>
          <p className="mt-2 font-medium text-ink">No hay recursos disponibles</p>
        </div>
      ) : null}

      {!loading && filtered.length > 0 ? (
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
              <button type="button" className="shrink-0 text-sm font-medium text-rose-dark hover:underline">
                Descargar
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <ModalSubirRecurso open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
