import { useCallback, useEffect, useId, useMemo, useState } from 'react'
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
    materia: raw.materia ?? raw.asignatura ?? raw.subject ?? 'General',
    descripcion: raw.descripcion ?? raw.description ?? '',
    integrantes: raw.integrantes ?? raw.total_miembros ?? raw.membersCount ?? raw.miembros ?? 0,
    semestre: raw.semestre ?? raw.semester ?? '—',
  }
}

const selectClass =
  'shrink-0 rounded-xl border border-rose bg-white px-3 py-2 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-rose'

const field =
  'w-full rounded-xl border border-rose bg-white px-4 py-3 text-ink placeholder:text-faded transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose'

export default function Comunidades() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [filterAsig, setFilterAsig] = useState('')
  const [filterSem, setFilterSem] = useState('')
  const [filterAct, setFilterAct] = useState('todas')
  const [showModal, setShowModal] = useState(false)

  const nombreModalId = useId()
  const descModalId = useId()
  const materiaModalId = useId()
  const semModalId = useId()
  const modalErrorId = useId()

  const [mcNombre, setMcNombre] = useState('')
  const [mcDescripcion, setMcDescripcion] = useState('')
  const [mcMateria, setMcMateria] = useState('')
  const [mcSemestre, setMcSemestre] = useState('1')
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')

  const loadComunidades = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/api/comunidades')
      setList(normalizeList(data).map(mapComunidad))
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadComunidades()
  }, [loadComunidades])

  const materias = useMemo(() => {
    const s = new Set(list.map((c) => c.materia).filter(Boolean))
    return ['', ...Array.from(s).sort()]
  }, [list])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return list.filter((c) => {
      const matchQ =
        !q || c.nombre.toLowerCase().includes(q) || c.materia.toLowerCase().includes(q)
      const matchA = !filterAsig || c.materia === filterAsig
      const matchS = !filterSem || String(c.semestre) === filterSem
      const matchAct =
        filterAct === 'todas' || (filterAct === 'activas' && Number(c.integrantes) < 20)
      return matchQ && matchA && matchS && matchAct
    })
  }, [list, query, filterAsig, filterSem, filterAct])

  function openModal() {
    setModalError('')
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setModalError('')
    setMcNombre('')
    setMcDescripcion('')
    setMcMateria('')
    setMcSemestre('1')
  }

  async function handleCrearComunidad(e) {
    e.preventDefault()
    setModalError('')
    if (!mcNombre.trim() || !mcMateria.trim()) {
      setModalError('Nombre y materia son obligatorios.')
      return
    }
    setModalLoading(true)
    try {
      await api.post('/api/comunidades', {
        nombre: mcNombre.trim(),
        descripcion: mcDescripcion.trim(),
        materia: mcMateria.trim(),
        semestre: Number(mcSemestre),
      })
      closeModal()
      await loadComunidades()
    } catch (err) {
      setModalError(getErrorMessage(err))
    } finally {
      setModalLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl text-ink">Comunidades</h1>
        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center gap-1 rounded-xl bg-rose px-4 py-2 text-sm font-medium text-ink shadow-sm transition-all duration-200 hover:bg-rose-dark hover:shadow-md"
        >
          ＋ Crear
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap">
        <select
          aria-label="Asignatura"
          value={filterAsig}
          onChange={(e) => setFilterAsig(e.target.value)}
          className={selectClass}
        >
          <option value="">Asignatura</option>
          {materias.filter(Boolean).map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          aria-label="Semestre"
          value={filterSem}
          onChange={(e) => setFilterSem(e.target.value)}
          className={selectClass}
        >
          <option value="">Semestre</option>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((s) => (
            <option key={s} value={String(s)}>
              {s}
            </option>
          ))}
        </select>
        <select
          aria-label="Activas"
          value={filterAct}
          onChange={(e) => setFilterAct(e.target.value)}
          className={selectClass}
        >
          <option value="todas">Todas</option>
          <option value="activas">Solo activas</option>
        </select>
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
        className="w-full max-w-md rounded-full border border-line bg-warm px-4 py-2.5 text-sm text-ink shadow-card placeholder:text-faded"
      />

      {loading ? (
        <div className="flex min-h-[12rem] flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-warm py-12">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-rose-light border-t-rose-dark"
            role="status"
            aria-label="Cargando"
          />
          <p className="text-sm text-stone">Cargando comunidades…</p>
        </div>
      ) : null}

      {!loading && error ? (
        <p className="rounded-xl border border-rose bg-blush px-4 py-3 text-sm text-rose-dark">{error}</p>
      ) : null}

      {!loading && !error && filtered.length === 0 ? (
        <p className="rounded-2xl border border-line bg-warm px-6 py-10 text-center text-stone">
          No hay comunidades disponibles
        </p>
      ) : null}

      {!loading && !error && filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((c) => (
            <ComunidadCard
              key={c.id}
              id={c.id}
              nombre={c.nombre}
              materia={c.materia}
              descripcion={c.descripcion}
              integrantes={c.integrantes}
              semestre={c.semestre}
              onJoined={loadComunidades}
            />
          ))}
        </div>
      ) : null}

      {showModal ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="w-full max-w-md rounded-3xl border border-line bg-warm p-6 shadow-xl">
            <h2 id="modal-title" className="font-display text-lg text-ink">
              Crear comunidad
            </h2>
            <form className="mt-4 space-y-4" onSubmit={handleCrearComunidad} noValidate>
              <div>
                <label htmlFor={nombreModalId} className="text-sm font-medium text-ink">
                  Nombre
                </label>
                <input
                  id={nombreModalId}
                  type="text"
                  required
                  value={mcNombre}
                  onChange={(e) => setMcNombre(e.target.value)}
                  className={`${field} mt-1`}
                  aria-invalid={Boolean(modalError)}
                  aria-describedby={modalError ? modalErrorId : undefined}
                />
              </div>
              <div>
                <label htmlFor={descModalId} className="text-sm font-medium text-ink">
                  Descripción
                </label>
                <textarea
                  id={descModalId}
                  rows={3}
                  value={mcDescripcion}
                  onChange={(e) => setMcDescripcion(e.target.value)}
                  className={`${field} mt-1 resize-y`}
                />
              </div>
              <div>
                <label htmlFor={materiaModalId} className="text-sm font-medium text-ink">
                  Materia
                </label>
                <input
                  id={materiaModalId}
                  type="text"
                  required
                  value={mcMateria}
                  onChange={(e) => setMcMateria(e.target.value)}
                  className={`${field} mt-1`}
                />
              </div>
              <div>
                <label htmlFor={semModalId} className="text-sm font-medium text-ink">
                  Semestre
                </label>
                <select
                  id={semModalId}
                  required
                  value={mcSemestre}
                  onChange={(e) => setMcSemestre(e.target.value)}
                  className={`${field} mt-1 appearance-none bg-white`}
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((s) => (
                    <option key={s} value={String(s)}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              {modalError ? (
                <p id={modalErrorId} className="text-sm text-rose-dark" role="alert">
                  {modalError}
                </p>
              ) : null}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-rose bg-white py-2.5 text-sm font-medium text-rose-dark transition-all duration-200 hover:bg-rose-light"
                  onClick={closeModal}
                  disabled={modalLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 rounded-xl bg-rose px-5 py-2.5 text-sm font-medium text-ink shadow-sm transition-all duration-200 hover:bg-rose-dark hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {modalLoading ? 'Creando…' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
