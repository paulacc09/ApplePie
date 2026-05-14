import { useMemo, useState } from 'react'
import MentorCard from '../components/MentorCard.jsx'

const MOCK_MENTORAS = [
  {
    id: '1',
    nombre: 'Sofía Ramírez',
    asignaturas: 'Cálculo III · Física',
    rating: 4.7,
    horas: 30,
    tags: ['Cálculo III', 'Física'],
  },
  {
    id: '2',
    nombre: 'Valentina Soto',
    asignaturas: 'Álgebra · Estructuras',
    rating: 4.9,
    horas: 42,
    tags: ['Álgebra', 'Estructuras'],
  },
  {
    id: '3',
    nombre: 'Camila Núñez',
    asignaturas: 'Programación · Matemáticas',
    rating: 4.5,
    horas: 18,
    tags: ['Programación', 'Matemáticas'],
  },
]

const selectClass =
  'rounded-xl border border-rose bg-white px-3 py-2 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-rose'

export default function Mentoria() {
  const [q, setQ] = useState('')
  const [asig, setAsig] = useState('')

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return MOCK_MENTORAS.filter((m) => {
      const ok = !s || m.nombre.toLowerCase().includes(s) || m.asignaturas.toLowerCase().includes(s)
      const okA = !asig || m.asignaturas.includes(asig)
      return ok && okA
    })
  }, [q, asig])

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="font-display text-2xl text-ink">Mentorías</h1>
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <input
            type="search"
            placeholder="Buscar mentora..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full max-w-md rounded-full border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-faded shadow-sm focus:outline-none focus:ring-2 focus:ring-rose sm:max-w-xs"
          />
          <select aria-label="Asignatura" value={asig} onChange={(e) => setAsig(e.target.value)} className={selectClass}>
            <option value="">Asignatura</option>
            <option>Cálculo III</option>
            <option>Física</option>
            <option>Álgebra</option>
            <option>Programación</option>
          </select>
          <button
            type="button"
            className="shrink-0 rounded-xl border border-rose bg-white px-4 py-2 text-sm font-medium text-rose-dark transition-all duration-200 hover:bg-rose-light"
          >
            Postularme como mentora
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((m) => (
          <MentorCard key={m.id} mentor={m} />
        ))}
      </div>
    </div>
  )
}
