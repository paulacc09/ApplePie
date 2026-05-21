import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/axios.js'
import { getErrorMessage } from '../lib/apiError.js'

const inputBase =
  'w-full rounded-xl border border-rose bg-white px-4 py-3 text-ink placeholder:text-faded transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose'

function mapPerfilToForm(data) {
  const nombreCompleto = [data.nombre, data.apellido].filter(Boolean).join(' ').trim()
  return {
    nombre: nombreCompleto || data.nombre || '',
    programa: data.programa ?? data.carrera ?? '',
    semestre: data.semestre != null && data.semestre !== '' ? String(data.semestre) : '1',
    bio: data.bio ?? '',
    foto_perfil: data.foto_perfil ?? null,
  }
}

async function subirFotoPerfil(file) {
  const formData = new FormData()
  formData.append('foto', file)
  return api.patch('/api/perfil/foto', formData, {
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
}

export default function EditarPerfil() {
  const nId = useId()
  const pId = useId()
  const sId = useId()
  const bId = useId()
  const fileInputRef = useRef(null)

  const [nombre, setNombre] = useState('')
  const [programa, setPrograma] = useState('')
  const [semestre, setSemestre] = useState('1')
  const [bio, setBio] = useState('')
  const [fotoPerfil, setFotoPerfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saveOk, setSaveOk] = useState(null)
  const [subiendoFoto, setSubiendoFoto] = useState(false)
  const [fotoError, setFotoError] = useState(null)
  const [fotoOk, setFotoOk] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadPerfil() {
      setLoading(true)
      setError(null)
      try {
        const { data } = await api.get('/api/perfil')
        if (cancelled) return
        const mapped = mapPerfilToForm(data)
        setNombre(mapped.nombre)
        setPrograma(mapped.programa)
        setSemestre(mapped.semestre)
        setBio(mapped.bio)
        setFotoPerfil(mapped.foto_perfil)
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadPerfil()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaveError(null)
    setSaveOk(null)
    setGuardando(true)
    try {
      await api.put('/api/perfil', {
        nombre: nombre.trim(),
        programa: programa.trim(),
        semestre: Number(semestre),
        bio: bio.trim(),
      })
      setSaveOk('Perfil actualizado correctamente.')
    } catch (err) {
      setSaveError(getErrorMessage(err))
    } finally {
      setGuardando(false)
    }
  }

  function abrirSelectorFoto() {
    fileInputRef.current?.click()
  }

  async function handleFotoChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setFotoError(null)
    setFotoOk(null)
    setSubiendoFoto(true)
    try {
      const { data } = await subirFotoPerfil(file)
      const url = data.foto_perfil ?? data.url ?? null
      if (url) setFotoPerfil(url)
      setFotoOk('Foto actualizada correctamente.')
    } catch (err) {
      setFotoError(getErrorMessage(err))
    } finally {
      setSubiendoFoto(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl pb-10">
        <p className="rounded-2xl border border-line bg-warm px-6 py-10 text-center text-sm text-stone">
          Cargando perfil…
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl pb-10">
        <Link to="/perfil" className="text-sm font-medium text-rose-dark hover:underline">
          ← Volver
        </Link>
        <p className="mt-4 rounded-xl border border-rose bg-blush px-4 py-3 text-sm text-rose-dark">{error}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl pb-10">
      <Link to="/perfil" className="text-sm font-medium text-rose-dark hover:underline">
        ← Volver
      </Link>
      <h1 className="mb-6 mt-4 font-display text-2xl text-ink">Editar perfil</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-line bg-white p-6">
            <h2 className="font-display text-lg text-ink">Editar información</h2>
            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor={nId} className="mb-1 block text-sm font-medium text-ink">
                  Nombre completo
                </label>
                <input id={nId} value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputBase} />
              </div>
              <div>
                <label htmlFor={pId} className="mb-1 block text-sm font-medium text-ink">
                  Programa / carrera
                </label>
                <input
                  id={pId}
                  value={programa}
                  onChange={(e) => setPrograma(e.target.value)}
                  className={inputBase}
                />
              </div>
              <div>
                <label htmlFor={sId} className="mb-1 block text-sm font-medium text-ink">
                  Semestre actual
                </label>
                <select id={sId} value={semestre} onChange={(e) => setSemestre(e.target.value)} className={inputBase}>
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor={bId} className="mb-1 block text-sm font-medium text-ink">
                  Bio
                </label>
                <textarea
                  id={bId}
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className={`${inputBase} h-auto min-h-[6rem] resize-y`}
                />
              </div>
              {saveError ? (
                <p className="rounded-xl border border-rose bg-blush px-4 py-3 text-sm text-rose-dark">{saveError}</p>
              ) : null}
              {saveOk ? (
                <p className="rounded-xl bg-mint px-4 py-2 text-sm text-olive">{saveOk}</p>
              ) : null}
              <button
                type="submit"
                disabled={guardando}
                className="rounded-xl bg-rose px-5 py-2.5 font-medium text-ink shadow-sm hover:bg-rose-dark disabled:opacity-60"
              >
                {guardando ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-display text-base text-ink">Foto de perfil</h2>
            <div className="mt-4 flex flex-col items-center gap-4">
              {fotoPerfil ? (
                <img
                  src={fotoPerfil}
                  alt="Foto de perfil"
                  className="h-24 w-24 rounded-full border border-line object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-rose-light text-2xl font-semibold text-ink">
                  {(nombre || '?').trim().charAt(0).toUpperCase()}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFotoChange}
              />
              <button
                type="button"
                onClick={abrirSelectorFoto}
                disabled={subiendoFoto}
                className="rounded-xl border border-rose bg-white px-4 py-2 text-sm font-medium text-rose-dark hover:bg-rose-light disabled:opacity-60"
              >
                {subiendoFoto ? 'Subiendo…' : 'Cambiar foto'}
              </button>
              {fotoError ? (
                <p className="w-full rounded-xl border border-rose bg-blush px-4 py-3 text-sm text-rose-dark">
                  {fotoError}
                </p>
              ) : null}
              {fotoOk ? (
                <p className="w-full rounded-xl bg-mint px-4 py-2 text-sm text-olive">{fotoOk}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
