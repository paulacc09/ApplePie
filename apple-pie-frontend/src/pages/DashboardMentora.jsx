import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const KPI = [
  { label: 'Sesiones totales', value: '24', sub: 'últimos 6 meses', color: 'text-rose-dark' },
  { label: 'Estudiantes atendidas', value: '18', sub: 'activas este mes', color: 'text-olive' },
  { label: 'Calificación promedio', value: '4.8', sub: '★★★★★', color: 'text-rose' },
  { label: 'Ingresos este mes', value: '$870k', sub: 'COP aprox.', color: 'text-ink' },
]

const pendientes = [
  {
    id: '1',
    nombre: 'Andrea S.',
    detalle: 'Cálculo III — Lun 15 May · 4:00pm',
    estado: 'Pendiente',
  },
  {
    id: '2',
    nombre: 'Paula C.',
    detalle: 'Álgebra — Mar 17 May · 10:00am',
    estado: 'Confirmada',
  },
]

const actividad = [
  { id: '1', texto: 'Nueva reseña de Andrea (5 estrellas)', tiempo: 'Hace 2 h' },
  { id: '2', texto: 'Sesión completada con Valentina', tiempo: 'Ayer' },
  { id: '3', texto: 'Subiste material “Parcial 2.pdf”', tiempo: 'Hace 3 días' },
]

export default function DashboardMentora() {
  const { user } = useAuth()
  const nombre = user?.nombre ?? user?.name ?? 'Mentora'

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <div className="rounded-2xl bg-gradient-to-r from-cream to-rose-light p-6">
        <h1 className="font-display text-2xl text-ink">Mi panel — Mentora</h1>
        <p className="mt-1 text-sm text-stone">
          Bienvenida, {nombre}. Aquí está el resumen de tu actividad como mentora.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {KPI.map((k) => (
          <div key={k.label} className="rounded-2xl border border-line bg-white p-5">
            <p className="text-sm text-stone">{k.label}</p>
            <p className={`mt-1 font-display text-3xl font-semibold ${k.color}`}>{k.value}</p>
            <p className="mt-1 text-xs text-faded">{k.sub}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="font-display text-lg text-ink">Sesiones pendientes</h2>
        <ul className="mt-2 list-none divide-y divide-cream-2 p-0">
          {pendientes.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-3 first:pt-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose text-sm font-semibold text-ink">
                {p.nombre.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{p.nombre}</p>
                <p className="text-xs text-faded">{p.detalle}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                  p.estado === 'Pendiente' ? 'bg-[#FDF3E3] text-[#D4884A]' : 'bg-mint text-olive'
                }`}
              >
                {p.estado}
              </span>
            </li>
          ))}
        </ul>
        <Link to="/mentora/agenda" className="mt-4 inline-block text-sm font-medium text-rose-dark hover:underline">
          Ver agenda completa →
        </Link>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="font-display text-lg text-ink">Actividad reciente</h2>
        <ul className="mt-2 list-none p-0">
          {actividad.map((a) => (
            <li key={a.id} className="flex gap-3 py-2">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-rose" aria-hidden="true" />
              <div>
                <p className="text-sm text-ink">{a.texto}</p>
                <span className="mt-0.5 block text-xs text-faded">{a.tiempo}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
