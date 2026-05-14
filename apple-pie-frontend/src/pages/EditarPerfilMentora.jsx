import { useId, useState } from 'react'

const inputBase =
  'w-full rounded-xl border border-rose bg-white px-4 py-3 text-ink placeholder:text-faded transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose'

const dias = [
  { dia: 'Lunes', ini: '16:00', fin: '18:00', activo: true },
  { dia: 'Jueves', ini: '10:00', fin: '12:00', activo: true },
  { dia: 'Miércoles', ini: '14:00', fin: '16:00', activo: false },
]

const reseñas = [
  { id: '1', nombre: 'Andrea S.', texto: 'Explica súper claro, me salvó el parcial.' },
  { id: '2', nombre: 'Laura M.', texto: 'Muy paciente y buenos materiales.' },
]

export default function EditarPerfilMentora() {
  const nId = useId()
  const aId = useId()
  const sId = useId()
  const dId = useId()

  const [nombre, setNombre] = useState('Sofía Ramírez')
  const [asigs, setAsigs] = useState('Cálculo III, Álgebra')
  const [sem, setSem] = useState('6')
  const [desc, setDesc] = useState('Mentora desde 2022. Me gusta el enfoque práctico.')

  return (
    <div className="mx-auto max-w-5xl pb-10">
      <h1 className="mb-6 font-display text-2xl text-ink">Editar perfil — Mentora</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-line bg-white p-6">
            <h2 className="font-display text-lg text-ink">Editar información</h2>
            <form className="mt-4 space-y-4" onSubmit={(e) => e.preventDefault()}>
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
              <button
                type="submit"
                className="rounded-xl bg-rose px-5 py-2.5 font-medium text-ink shadow-sm hover:bg-rose-dark"
              >
                Guardar cambios
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
                  </tr>
                </thead>
                <tbody>
                  {dias.map((d) => (
                    <tr key={d.dia} className="border-t border-cream-2">
                      <td className="py-2 pr-2 text-ink">{d.dia}</td>
                      <td className="py-2 pr-2">
                        <input type="time" defaultValue={d.ini} className={inputBase} />
                      </td>
                      <td className="py-2 pr-2">
                        <input type="time" defaultValue={d.fin} className={inputBase} />
                      </td>
                      <td className="py-2">
                        <span className="rounded-full bg-mint px-2 py-0.5 text-xs text-olive">
                          {d.activo ? 'Activo' : 'Pausado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" className="mt-3 text-sm font-medium text-rose-dark hover:underline">
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
