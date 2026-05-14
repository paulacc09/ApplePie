import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/axios.js'
import { getErrorMessage } from '../lib/apiError.js'
import ComunidadCard from '../components/ComunidadCard.jsx'

function normalizeList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.comunidades)) return data.comunidades
  if (Array.isArray(data?.data)) return data.data
  return []
}

function mapComunidad(raw, index) {
  const id = raw.id ?? raw._id ?? raw.uuid ?? String(index)
  return {
    id: String(id),
    nombre: raw.nombre ?? raw.name ?? 'Sin nombre',
    materia: raw.materia ?? raw.subject ?? 'General',
    descripcion: raw.descripcion ?? raw.description ?? '',
    integrantes: raw.integrantes ?? raw.membersCount ?? raw.miembros ?? 0,
    semestre: raw.semestre ?? raw.semester ?? '—',
  }
}

export default function Comunidades() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get('/api/comunidades')
        if (!cancelled) setList(normalizeList(data).map(mapComunidad))
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter((c) => c.nombre.toLowerCase().includes(q) || c.materia.toLowerCase().includes(q))
  }, [list, query])

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Comunidades</h1>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="rounded-xl bg-[#6C63FF] px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-[#5855d6]"
        >
          Crear comunidad
        </button>
      </div>

      <label htmlFor="com-search" className="sr-only">
        Buscar comunidades
      </label>
      <input
        id="com-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nombre o materia..."
        className="w-full max-w-md rounded-full border border-[#F9C5D1] bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm transition-all duration-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl bg-white/80 dark:bg-gray-900/80"
              aria-hidden="true"
            />
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {!loading && !error && filtered.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">No hay comunidades disponibles</p>
      ) : null}

      {!loading && !error && filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <ComunidadCard
              key={c.id}
              id={c.id}
              nombre={c.nombre}
              materia={c.materia}
              descripcion={c.descripcion}
              integrantes={c.integrantes}
              semestre={c.semestre}
            />
          ))}
        </div>
      ) : null}

      {showModal ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-lg dark:bg-gray-900">
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
              Crear comunidad
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Pronto podrás crear grupos desde aquí. Esta ventana es solo visual por ahora.
            </p>
            <button
              type="button"
              className="mt-6 w-full rounded-xl bg-[#6C63FF] py-2.5 font-medium text-white transition-all duration-200 hover:bg-[#5855d6]"
              onClick={() => setShowModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
