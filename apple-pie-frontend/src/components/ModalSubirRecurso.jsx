import { useId, useRef, useState } from 'react'
import api from '../api/axios.js'
import { getErrorMessage } from '../lib/apiError.js'

const inputBase =
  'w-full rounded-xl border border-rose bg-white px-4 py-3 text-ink placeholder:text-faded transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose'

export default function ModalSubirRecurso({ open, onClose, onUploaded }) {
  const fileInputRef = useRef(null)
  const tituloId = useId()
  const descId = useId()
  const asigId = useId()
  const semId = useId()
  const tipoId = useId()
  const accesoId = useId()

  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [asignatura, setAsignatura] = useState('')
  const [semestre, setSemestre] = useState('1')
  const [tipo, setTipo] = useState('PDF')
  const [acceso, setAcceso] = useState('gratis')
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')

  if (!open) return null

  function handleFileChange(e) {
    const f = e.target.files?.[0]
    setFileName(f ? f.name : '')
  }

  function handleDrop(e) {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f) {
      setFileName(f.name)
      if (fileInputRef.current) {
        try {
          const dt = new DataTransfer()
          dt.items.add(f)
          fileInputRef.current.files = dt.files
        } catch {
          /* noop */
        }
      }
    }
  }

  function resetForm() {
    setTitulo('')
    setDescripcion('')
    setAsignatura('')
    setSemestre('1')
    setTipo('PDF')
    setAcceso('gratis')
    setFileName('')
    setFormError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      setFormError('Selecciona un archivo para subir.')
      return
    }
    if (!titulo.trim() || !asignatura.trim()) {
      setFormError('Completa título y asignatura.')
      return
    }

    setLoading(true)
    try {
      const archivo = file
      const formData = new FormData()
      formData.append('titulo', titulo.trim())
      formData.append('descripcion', descripcion.trim())
      formData.append('asignatura', asignatura.trim())
      formData.append('semestre', semestre)
      formData.append('tipo', tipo)
      formData.append('acceso', acceso)
      formData.append('archivo', archivo)

      await api.post('/api/recursos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: [
          (data, headers) => {
            if (data instanceof FormData) {
              if (headers && typeof headers.delete === 'function') {
                headers.delete('Content-Type')
              } else if (headers) {
                delete headers['Content-Type']
                delete headers['content-type']
              }
            }
            return data
          },
        ],
      })

      resetForm()
      onUploaded?.()
      onClose()
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="relative w-full max-w-md rounded-3xl border border-line bg-warm p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-subir-titulo"
      >
        <button
          type="button"
          className="absolute right-4 top-4 text-faded transition-colors hover:text-rose-dark"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ✕
        </button>
        <div className="overflow-y-auto max-h-[85vh]">
          <h2 id="modal-subir-titulo" className="font-display text-lg text-ink">
            Subir nuevo recurso
          </h2>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor={tituloId} className="mb-1 block text-sm font-medium text-ink">
              Título
            </label>
            <input
              id={tituloId}
              name="titulo"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej. Guía parcial 2"
              className={inputBase}
            />
          </div>
          <div>
            <label htmlFor={descId} className="mb-1 block text-sm font-medium text-ink">
              Descripción
            </label>
            <textarea
              id={descId}
              name="descripcion"
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className={`${inputBase} resize-y`}
            />
          </div>
          <div>
            <label htmlFor={asigId} className="mb-1 block text-sm font-medium text-ink">
              Asignatura
            </label>
            <input
              id={asigId}
              name="asignatura"
              required
              value={asignatura}
              onChange={(e) => setAsignatura(e.target.value)}
              className={inputBase}
            />
          </div>
          <div>
            <label htmlFor={semId} className="mb-1 block text-sm font-medium text-ink">
              Semestre
            </label>
            <select
              id={semId}
              name="semestre"
              required
              value={semestre}
              onChange={(e) => setSemestre(e.target.value)}
              className={inputBase}
            >
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i + 1} value={String(i + 1)}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={tipoId} className="mb-1 block text-sm font-medium text-ink">
              Tipo
            </label>
            <select
              id={tipoId}
              name="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className={inputBase}
            >
              <option>PDF</option>
              <option>DOCX</option>
              <option>PPTX</option>
              <option>Imagen</option>
              <option>Otro</option>
            </select>
          </div>
          <div>
            <label htmlFor={accesoId} className="mb-1 block text-sm font-medium text-ink">
              Acceso
            </label>
            <select
              id={accesoId}
              name="acceso"
              value={acceso}
              onChange={(e) => setAcceso(e.target.value)}
              className={inputBase}
            >
              <option value="gratis">Gratis</option>
              <option value="miembros">Solo miembros</option>
            </select>
          </div>

          <input ref={fileInputRef} type="file" name="archivo" className="hidden" onChange={handleFileChange} />

          <button
            type="button"
            className="w-full cursor-pointer rounded-2xl border-2 border-dashed border-rose bg-cream p-8 text-center transition-colors hover:bg-rose-light"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <span className="text-2xl text-rose" aria-hidden="true">
              ↑
            </span>
            <p className="mt-2 text-sm text-stone">Arrastra tu archivo aquí</p>
            <p className="mt-1 text-xs text-faded">o haz clic para seleccionar</p>
            {fileName ? <p className="mt-2 text-sm font-medium text-olive">{fileName}</p> : null}
          </button>

          {formError ? (
            <p className="rounded-xl border border-rose bg-blush px-3 py-2 text-sm text-rose-dark" role="alert">
              {formError}
            </p>
          ) : null}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-rose bg-white py-2.5 text-sm font-medium text-rose-dark transition-all duration-200 hover:bg-rose-light"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-rose py-2.5 text-sm font-medium text-ink shadow-sm transition-all duration-200 hover:bg-rose-dark hover:shadow-md disabled:opacity-50"
            >
              {loading ? 'Subiendo...' : 'Subir archivo'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}
