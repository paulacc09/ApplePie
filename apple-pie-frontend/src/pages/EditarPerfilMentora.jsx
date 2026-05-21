import { useEffect, useId, useState } from 'react'
import { api } from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import { getErrorMessage } from '../lib/apiError.js'

const inputBase =
  'w-full rounded-xl border border-rose bg-white px-4 py-3 text-ink placeholder:text-faded transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose'

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const reseñas = [
  { id: '1', nombre: 'Andrea S.', texto: 'Explica súper claro, me salvó el parcial.' },
  { id: '2', nombre: 'Laura M.', texto: 'Muy paciente y buenos materiales.' },
]

function parseDisponibilidad(raw) {
  if (!raw) return null
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : null
    } catch {
      return null
    }
  }
  return null
}

function mapPerfilToForm(data) {
  const nombreCompleto = [data.nombre, data.apellido].filter(Boolean).join(' ').trim()
  const parsed = parseDisponibilidad(data.disponibilidad)

  return {
    nombre: nombreCompleto || data.nombre || '',
    asigs: data.asignaturas ?? data.especialidades ?? '',
    sem: data.semestre != null && data.semestre !== '' ? String(data.semestre) : '1',
    desc: data.descripcion ?? data.bio_mentora ?? data.bio ?? '',
    dias: parsed ?? [],
  }
}

export default function EditarPerfilMentora() {
  const { user } = useAuth()
  const nId = useId()
  const aId = useId()
  const sId = useId()
  const dId = useId()

  const [nombre, setNombre] = useState('')
  const [asigs, setAsigs] = useState('')
  const [sem, setSem] = useState('1')
  const [desc, setDesc] = useState('')
  const [dias, setDias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saveOk, setSaveOk] = useState(null)

  const diasUsados = new Set(dias.map((d) => d.dia))
  const puedeAgregar = dias.length < DIAS_SEMANA.length

  useEffect(() => {
    const uid = user?.id ?? user?._id
    if (uid == null) {
      setLoading(false)
      setError('No se pudo identificar al usuario autenticado.')
      return
    }

    let cancelled = false

    async function loadPerfil() {
      setLoading(true)
      setError(null)
      try {
        const { data } = await api.get(`/api/mentoras/${uid}`)
        if (cancelled) return
        const mapped = mapPerfilToForm(data)
        setNombre(mapped.nombre)
        setAsigs(mapped.asigs)
        setSem(mapped.sem)
        setDesc(mapped.desc)
        setDias(mapped.dias)
      } catch (e) {
        if (!cancelled) {
          setError(getErrorMessage(e))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadPerfil()
    return () => {
      cancelled = true
    }
  }, [user?.id, user?._id])

  function agregarHorario() {
    const siguiente = DIAS_SEMANA.find((d) => !diasUsados.has(d))
    if (!siguiente) return
    setDias((prev) => [...prev, { dia: siguiente, ini: '08:00', fin: '09:00', activo: true }])
  }

  function actualizarDia(index, campo, valor) {
    setDias((prev) => prev.map((row, i) => (i === index ? { ...row, [campo]: valor } : row)))
  }

  function cambiarDia(index, nuevoDia) {
    setDias((prev) => prev.map((row, i) => (i === index ? { ...row, dia: nuevoDia } : row)))
  }

  function toggleActivo(index) {
    setDias((prev) => prev.map((row, i) => (i === index ? { ...row, activo: !row.activo } : row)))
  }

  function eliminarFila(index) {
    setDias((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const uid = user?.id ?? user?._id
    setSaveError(null)
    setSaveOk(null)

    if (uid == null) {
      setSaveError('No se pudo identificar al usuario autenticado.')
      return
    }

    setGuardando(true)
    try {
      await api.put(`/api/mentoras/${uid}`, {
        nombre,
        asignaturas: asigs,
        semestre: sem,
        descripcion: desc,
        disponibilidad: dias,
      })
      setSaveOk('Perfil actualizado correctamente.')
    } catch (err) {
      setSaveError(getErrorMessage(err))
    } finally {
      setGuardando(false)
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
        <p className="rounded-xl border border-rose bg-blush px-4 py-3 text-sm text-rose-dark">{error}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl pb-10">
      <h1 className="mb-6 font-display text-2xl text-ink">Editar perfil — Mentora</h1>
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
                <label htmlFor={aId} className="mb-1 block text-sm font-medium text-ink">
                  Asignaturas en las que es mentora
                </label>
                <input
                  id={aId}
                  value={asigs}
                  onChange={(e) => setAsigs(e.target.value)}
                  placeholder="Separadas por coma"
                  className={inputBase}
                />
              </div>
              <div>
                <label htmlFor={sId} className="mb-1 block text-sm font-medium text-ink">
                  Semestre actual
                </label>
                <select id={sId} value={sem} onChange={(e) => setSem(e.target.value)} className={inputBase}>
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor={dId} className="mb-1 block text-sm font-medium text-ink">
                  Descripción
                </label>
                <textarea
                  id={dId}
                  rows={4}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
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
            <h2 className="font-display text-base text-ink">Disponibilidad semanal</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[280px] text-left text-sm">
                <thead>
                  <tr className="text-xs text-stone">
                    <th className="py-2 pr-2">Día</th>
                    <th className="py-2 pr-2">Inicio</th>
                    <th className="py-2 pr-2">Fin</th>
                    <th className="py-2">Estado</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {dias.map((d, index) => (
                    <tr key={`${index}-${d.dia}`} className="border-t border-cream-2">
                      <td className="py-2 pr-2">
                        <select
                          value={d.dia}
                          onChange={(e) => cambiarDia(index, e.target.value)}
                          className={inputBase}
                          aria-label={`Día fila ${index + 1}`}
                        >
                          {DIAS_SEMANA.filter(
                            (dia) => dia === d.dia || !dias.some((row, i) => i !== index && row.dia === dia),
                          ).map((dia) => (
                            <option key={dia} value={dia}>
                              {dia}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="time"
                          value={d.ini}
                          onChange={(e) => actualizarDia(index, 'ini', e.target.value)}
                          className={inputBase}
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="time"
                          value={d.fin}
                          onChange={(e) => actualizarDia(index, 'fin', e.target.value)}
                          className={inputBase}
                        />
                      </td>
                      <td className="py-2">
                        <button
                          type="button"
                          onClick={() => toggleActivo(index)}
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            d.activo ? 'bg-mint text-olive' : 'bg-blush text-rose-dark'
                          }`}
                        >
                          {d.activo ? 'Activo' : 'Pausado'}
                        </button>
                      </td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          onClick={() => eliminarFila(index)}
                          className="text-sm text-rose-dark hover:underline"
                          aria-label="Eliminar horario"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={agregarHorario}
              disabled={!puedeAgregar}
              className="mt-3 text-sm font-medium text-rose-dark hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              + Agregar horario
            </button>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-display text-base text-ink">Reseñas recibidas</h2>
            <ul className="mt-2 list-none divide-y divide-cream-2 p-0">
              {reseñas.map((r) => (
                <li key={r.id} className="flex items-start gap-3 py-3 first:pt-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose text-xs font-semibold text-ink">
                    {r.nombre.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {r.nombre} <span className="text-rose">★★★★★</span>
                    </p>
                    <p className="mt-0.5 text-xs italic text-stone">{r.texto}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
