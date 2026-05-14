import { Link } from 'react-router-dom'

function stars(rating) {
  const full = Math.round(rating)
  const out = []
  for (let i = 1; i <= 5; i += 1) {
    out.push(
      <span key={i} className={i <= full ? 'text-rose' : 'text-line'} aria-hidden="true">
        {i <= full ? '★' : '☆'}
      </span>,
    )
  }
  return out
}

export default function MentorCard({ mentor }) {
  const { id, nombre, asignaturas, rating, horas, tags } = mentor
  const inicial = (nombre || '?').trim().charAt(0).toUpperCase()

  return (
    <article className="rounded-2xl border border-line bg-white p-5 transition-all duration-200 hover:border-rose hover:shadow-md">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-olive text-xl font-semibold text-white">
        {inicial}
      </div>
      <h3 className="mt-3 font-display text-base font-semibold text-ink">{nombre}</h3>
      <p className="mt-1 text-xs text-stone">{asignaturas}</p>
      <div className="mt-2 flex flex-wrap items-center gap-0.5">
        {stars(rating)}
        <span className="ml-1 text-xs text-stone">
          ({rating} · {horas} horas)
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {tags.map((t) => (
          <span key={t} className="rounded-full bg-rose-light px-2 py-0.5 text-xs text-rose-dark">
            {t}
          </span>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          className="flex-1 rounded-xl bg-olive px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-olive-deep"
        >
          Agendar
        </button>
        <Link
          to={`/mentoria/${id}`}
          className="flex-1 cursor-pointer select-none rounded-xl border border-rose bg-white py-2 text-center text-sm font-medium text-rose-dark transition-all duration-200 hover:bg-rose-light active:scale-95"
        >
          Ver perfil
        </Link>
      </div>
    </article>
  )
}
