const diasSemana = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const conSesion = new Set([15, 16, 19, 24])
const resaltados = new Set([15, 16, 19, 24])

const tablaRows = [
  {
    est: 'Andrea S.',
    asig: 'Cálculo III',
    fecha: '12 May 2026',
    dur: '1 h',
    val: '★★★★★',
    pago: '$35.000',
    estado: 'Completada',
  },
  {
    est: 'Paula C.',
    asig: 'Álgebra',
    fecha: '10 May 2026',
    dur: '1 h',
    val: '★★★★☆',
    pago: '$28.000',
    estado: 'Pendiente',
  },
]

const semana = [
  { id: '1', inicial: 'A', nombre: 'Andrea', asig: 'Cálculo III', hora: 'Jue 15 · 4:00pm - 5:00pm' },
  { id: '2', inicial: 'V', nombre: 'Valentina', asig: 'Física I', hora: 'Vie 16 · 10:00am - 11:00am' },
]

export default function AgendaMentora() {
  const hoy = 15
  const nums = Array.from({ length: 31 }, (_, i) => i + 1)
  const firstDow = new Date(2026, 4, 1).getDay()
  const padded = [...Array(firstDow).fill(null), ...nums]

  return (
    <div className="mx-auto max-w-6xl pb-10">
      <h1 className="mb-6 font-display text-2xl text-ink">Mi agenda</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-line bg-white p-6">
            <div className="flex items-center justify-between">
              <button type="button" className="text-lg text-rose-dark">
                ‹
              </button>
              <h2 className="font-display text-lg text-ink">Mayo 2026</h2>
              <button type="button" className="text-lg text-rose-dark">
                ›
              </button>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-faded">
              {diasSemana.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1 text-center text-sm">
              {padded.map((d, idx) => {
                if (d == null) {
                  return <div key={`e-${idx}`} className="py-1" />
                }
                const ses = conSesion.has(d)
                const sel = d === hoy
                const res = resaltados.has(d)
                return (
                  <div key={d} className="flex flex-col items-center py-1">
                    <button
                      type="button"
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                        sel ? 'bg-rose text-white' : res ? 'bg-rose-light text-ink' : 'text-ink hover:bg-rose-light'
                      }`}
                    >
                      {d}
                    </button>
                    {ses ? <span className="mt-0.5 block h-1 w-1 rounded-full bg-rose" aria-hidden="true" /> : null}
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-stone">
              <span>
                <span className="text-rose" aria-hidden="true">
                  ●
                </span>{' '}
                Sesión agendada
              </span>
              <span>
                <span className="text-ink" aria-hidden="true">
                  ●
                </span>{' '}
                Hoy
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-lg text-ink">Historial de sesiones</h2>
              <span className="text-sm text-faded">24 sesiones realizadas</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-cream text-xs uppercase tracking-wider text-stone">
                    <th className="px-3 py-3">Estudiante</th>
                    <th className="px-3 py-3">Asignatura</th>
                    <th className="px-3 py-3">Fecha</th>
                    <th className="px-3 py-3">Duración</th>
                    <th className="px-3 py-3">Valoración</th>
                    <th className="px-3 py-3">Pago</th>
                    <th className="px-3 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="text-ink">
                  {tablaRows.map((r, i) => (
                    <tr key={i} className="border-b border-cream-2">
                      <td className="px-3 py-3">{r.est}</td>
                      <td className="px-3 py-3">{r.asig}</td>
                      <td className="px-3 py-3">{r.fecha}</td>
                      <td className="px-3 py-3">{r.dur}</td>
                      <td className="px-3 py-3 text-xs text-rose">{r.val}</td>
                      <td className="px-3 py-3 font-medium">{r.pago}</td>
                      <td className="px-3 py-3">
                        <span
                          className={
                            r.estado === 'Completada' ? 'font-medium text-olive' : 'font-medium text-[#D4884A]'
                          }
                        >
                          {r.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-display text-base text-ink">Sesiones de esta semana</h2>
            <div className="mt-3 space-y-3">
              {semana.map((s) => (
                <div
                  key={s.id}
                  className="rounded-xl bg-cream p-4 transition-colors hover:bg-rose-light"
                >
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose text-sm font-semibold text-ink">
                      {s.inicial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink">{s.nombre}</p>
                      <p className="text-xs text-faded">{s.asig}</p>
                      <p className="mt-1 text-xs text-faded">{s.hora}</p>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          className="rounded-lg bg-rose px-3 py-1.5 text-xs font-medium text-ink hover:bg-rose-dark"
                        >
                          Confirmar
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-rose bg-white px-3 py-1.5 text-xs font-medium text-rose-dark hover:bg-rose-light"
                        >
                          Reagendar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
