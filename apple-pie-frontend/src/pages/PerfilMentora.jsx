import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ModalPago from '../components/ModalPago.jsx'

const MOCK = {
  nombre: 'Sofía Ramírez',
  carrera: 'Ingeniería civil · Universidad de Ibagué',
  desc: 'Me encanta explicar cálculo con ejemplos del día a día. Llevo 3 años mentorando en Apple Pie.',
  rating: 4.7,
  horas: 30,
  materias: 'Cálculo III, Álgebra',
  tags: ['Cálculo III', 'Álgebra', 'Física I'],
  contacto: { lugar: 'Ibagué', email: 'sofia@email.com', horario: 'Lunes, Martes y Viernes' },
  cursos: [
    { id: '1', nombre: 'Repaso integral', desc: 'Series, integrales y aplicaciones.', nivel: '1 lección' },
    { id: '2', nombre: 'Parciales tipo examen', desc: 'Simulacros con retroalimentación.', nivel: '2 lecciones' },
  ],
  archivos: [
    { id: '1', nombre: 'Formulario derivadas.pdf', tipo: 'PDF', desc: 'Resumen de reglas.', precio: '$12.000' },
    { id: '2', nombre: 'Taller límites.docx', tipo: 'DOCX', desc: 'Ejercicios paso a paso.', precio: '$8.000' },
  ],
}

const tabs = [
  { id: 'cursos', label: 'Cursos' },
  { id: 'tarifas', label: 'Tarifas' },
  { id: 'archivos', label: 'Archivos' },
  { id: 'sobre', label: 'Sobre mí' },
]

function fileBadge(tipo) {
  if (tipo === 'PDF')
    return <span className="rounded bg-blush px-2 py-2 text-xs font-bold text-rose-dark">PDF</span>
  if (tipo === 'DOCX')
    return <span className="rounded bg-[#E8F0FE] px-2 py-2 text-xs font-bold text-[#5B7FD4]">DOC</span>
  return <span className="rounded bg-[#FDF3E3] px-2 py-2 text-xs font-bold text-[#D4884A]">PPT</span>
}

export default function PerfilMentora() {
  const { id } = useParams()
  const { user } = useAuth()
  const [tab, setTab] = useState('cursos')
  const [pagoOpen, setPagoOpen] = useState(false)
  const [planSel, setPlanSel] = useState({ nombre: 'Individual', precio: '$35.000' })

  const esMio = useMemo(() => {
    const uid = user?.id ?? user?._id
    return uid != null && String(uid) === String(id)
  }, [user, id])

  const m = MOCK

  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-10">
      <Link to="/mentoria" className="text-sm font-medium text-rose-dark hover:underline">
        ← Volver a mentorías
      </Link>

      <header className="relative rounded-2xl border border-line bg-white p-6">
        {esMio ? (
          <button
            type="button"
            className="absolute right-4 top-4 text-faded hover:text-rose-dark"
            aria-label="Ajustes de perfil"
          >
            ⚙️
          </button>
        ) : null}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-olive text-2xl font-semibold text-white">
            {m.nombre.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-xl text-ink">{m.nombre}</h1>
            <p className="text-sm text-stone">{m.carrera}</p>
            <p className="mt-2 text-sm text-stone">
              <span aria-hidden="true">⭐</span> {m.rating} · <span className="mx-1">·</span> 📚 {m.materias} · 🕐 {m.horas}{' '}
              horas
            </p>
            <p className="mt-3 text-sm italic text-stone">{m.desc}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-faded">
              <span>📍 {m.contacto.lugar}</span>
              <span>✉️ {m.contacto.email}</span>
              <span>🕐 {m.contacto.horario}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {m.tags.map((t) => (
                <span key={t} className="rounded-full bg-rose-light px-2 py-0.5 text-xs text-rose-dark">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="flex gap-1 rounded-xl bg-cream p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
              tab === t.id ? 'bg-olive text-white' : 'text-stone hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'cursos' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {m.cursos.map((c) => (
            <article
              key={c.id}
              className="rounded-2xl border border-line bg-white p-4 transition-all hover:border-rose"
            >
              <h3 className="font-medium text-ink">{c.nombre}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-stone">{c.desc}</p>
              <span className="mt-2 inline-block rounded-full bg-mint px-2 py-0.5 text-xs text-olive">{c.nivel}</span>
              <button
                type="button"
                className="mt-3 w-full rounded-xl border border-rose bg-white py-2 text-sm font-medium text-rose-dark transition-all hover:bg-rose-light"
              >
                Ver curso
              </button>
            </article>
          ))}
        </div>
      ) : null}

      {tab === 'tarifas' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border-2 border-rose bg-[#FFF8F9] p-5 text-center">
            <p className="text-2xl" aria-hidden="true">
              👤
            </p>
            <h3 className="mt-2 font-display text-lg text-ink">Individual</h3>
            <p className="text-xs text-stone">1 alumna</p>
            <p className="my-3 font-display text-3xl font-semibold text-rose-dark">$35.000</p>
            <button
              type="button"
              onClick={() => {
                setPlanSel({ nombre: 'Individual', precio: '$35.000' })
                setPagoOpen(true)
              }}
              className="w-full rounded-xl bg-rose py-2.5 text-sm font-medium text-ink shadow-sm hover:bg-rose-dark"
            >
              Agendar y pagar
            </button>
          </div>
          <div className="rounded-2xl border-2 border-olive bg-[#F8FBF5] p-5 text-center">
            <p className="text-2xl" aria-hidden="true">
              👥
            </p>
            <h3 className="mt-2 font-display text-lg text-ink">Grupal</h3>
            <p className="text-xs text-stone">Hasta 5 alumnas</p>
            <p className="my-3 font-display text-3xl font-semibold text-olive">$18.000</p>
            <button
              type="button"
              onClick={() => {
                setPlanSel({ nombre: 'Grupal', precio: '$18.000' })
                setPagoOpen(true)
              }}
              className="w-full rounded-xl bg-olive py-2.5 text-sm font-medium text-white hover:bg-olive-deep"
            >
              Agendar y pagar
            </button>
          </div>
          <div className="rounded-2xl border-2 border-faded bg-[#FDFAFA] p-5 text-center">
            <p className="text-2xl" aria-hidden="true">
              ⚡
            </p>
            <h3 className="mt-2 font-display text-lg text-ink">Intensiva</h3>
            <p className="text-xs text-stone">3 sesiones / semana</p>
            <p className="my-3 font-display text-3xl font-semibold text-stone">$95.000</p>
            <button
              type="button"
              onClick={() => {
                setPlanSel({ nombre: 'Intensiva', precio: '$95.000' })
                setPagoOpen(true)
              }}
              className="w-full rounded-xl border border-rose bg-white py-2.5 text-sm font-medium text-rose-dark hover:bg-rose-light"
            >
              Agendar y pagar
            </button>
          </div>
        </div>
      ) : null}

      {tab === 'archivos' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {m.archivos.map((a) => (
            <article
              key={a.id}
              className="rounded-2xl border border-line bg-white p-4 transition-all hover:border-rose hover:shadow-sm"
            >
              <div className="flex justify-center">{fileBadge(a.tipo)}</div>
              <h3 className="mt-3 text-sm font-medium text-ink">{a.nombre}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-stone">{a.desc}</p>
              <p className="mt-2 font-semibold text-rose-dark">{a.precio}</p>
              <button
                type="button"
                className="mt-3 w-full rounded-xl bg-rose py-2 text-sm font-medium text-ink shadow-sm hover:bg-rose-dark"
              >
                Comprar
              </button>
            </article>
          ))}
        </div>
      ) : null}

      {tab === 'sobre' ? (
        <div className="space-y-6 rounded-2xl border border-line bg-white p-6">
          <section>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-olive">Experiencia</h4>
            <p className="text-sm text-ink">
              Más de 4 años dando tutorías en cálculo y física básica. He acompañado a más de 60 estudiantes en
              parciales y proyectos.
            </p>
          </section>
          <section>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-olive">Especialidades</h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-ink marker:text-rose">
              <li>Integrales y series</li>
              <li>Mecánica newtoniana</li>
              <li>Álgebra lineal aplicada</li>
            </ul>
          </section>
          <section>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-olive">Logros destacados</h4>
            <ul className="space-y-1 text-sm text-ink">
              <li>
                <span className="text-olive">·</span> Mentora destacada 2024
              </li>
              <li>
                <span className="text-olive">·</span> 100% de estudiantes aprobadas en su primer parcial conmigo
              </li>
            </ul>
          </section>
        </div>
      ) : null}

      <ModalPago
        open={pagoOpen}
        onClose={() => setPagoOpen(false)}
        planNombre={planSel.nombre}
        planPrecio={planSel.precio}
      />
    </div>
  )
}
