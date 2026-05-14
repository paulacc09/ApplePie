const rows = [
  {
    nombre: 'Guía límites.pdf',
    asig: 'Cálculo III',
    tipo: 'PDF',
    subido: '10 May 2026',
    compartido: 'publico',
  },
  {
    nombre: 'Taller vectores.pptx',
    asig: 'Álgebra',
    tipo: 'PPTX',
    subido: '2 May 2026',
    compartido: 'sesiones',
  },
  {
    nombre: 'Resumen física.docx',
    asig: 'Física I',
    tipo: 'DOCX',
    subido: '28 Abr 2026',
    compartido: 'publico',
  },
]

function tipoBadge(t) {
  if (t === 'PDF')
    return <span className="rounded bg-blush px-2 py-0.5 text-xs font-bold text-rose-dark">PDF</span>
  if (t === 'DOCX')
    return <span className="rounded bg-[#E8F0FE] px-2 py-0.5 text-xs font-bold text-[#5B7FD4]">DOCX</span>
  return <span className="rounded bg-[#FDF3E3] px-2 py-0.5 text-xs font-bold text-[#D4884A]">PPTX</span>
}

export default function MaterialesMentora() {
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
          className="rounded-xl border border-rose bg-white px-3 py-2 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-rose"
        >
          <option>Todas las asignaturas</option>
          <option>Cálculo III</option>
          <option>Álgebra</option>
          <option>Física I</option>
        </select>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-xl bg-olive px-4 py-2 text-sm font-medium text-white hover:bg-olive-deep"
        >
          + Subir material
        </button>
      </div>

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
            {rows.map((r) => (
              <tr key={r.nombre} className="border-b border-cream-2 transition-colors hover:bg-[#FAFAF8]">
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
