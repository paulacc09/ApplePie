import { Link } from 'react-router-dom'
import LogoApplePie from '../components/LogoApplePie.jsx'

const resources = [
  { title: 'Apuntes Cálculo III — Semestre 2025', type: 'PDF' },
  { title: 'Guía Estructuras de Datos', type: 'PDF' },
  { title: 'Formulario Física Moderna', type: 'PDF' },
]

const cards = [
  {
    emoji: '👥',
    title: 'Comunidad de estudio',
    text: 'Aprende con otras ingenieras',
  },
  {
    emoji: '📁',
    title: 'Repositorio académico',
    text: 'Accede a recursos de calidad',
  },
  {
    emoji: '🎓',
    title: 'Mentorías entre pares',
    text: 'Aprende de quienes ya lo vivieron',
  },
]

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col overflow-y-auto bg-cream">
      <nav className="flex items-center justify-between border-b border-line bg-warm px-4 py-4 shadow-sm md:px-10">
        <LogoApplePie to="/" />
        <div className="flex gap-2 sm:gap-3">
          <Link
            to="/login"
            className="rounded-xl border border-rose bg-white px-4 py-2.5 text-sm font-medium text-rose-dark transition-all duration-200 hover:bg-rose-light"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/registro"
            className="rounded-xl bg-rose px-4 py-2.5 text-sm font-medium text-ink shadow-sm transition-all duration-200 hover:bg-rose-dark hover:shadow-md"
          >
            Únete gratis
          </Link>
        </div>
      </nav>

      <section className="bg-gradient-to-b from-cream to-cream-2 px-4 py-16 text-center md:py-24">
        <h1 className="mx-auto max-w-3xl font-display text-3xl text-ink md:text-5xl">
          Comunidad de chicas en ingeniería
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-stone md:text-lg">
          Empoderando mujeres en ingeniería mediante el aprendizaje colaborativo
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/registro"
            className="rounded-xl bg-rose px-8 py-3 font-medium text-ink shadow-sm transition-all duration-200 hover:bg-rose-dark hover:shadow-md"
          >
            Únete gratis
          </Link>
          <Link
            to="/login"
            className="rounded-xl border border-rose bg-white px-8 py-3 font-medium text-rose-dark shadow-sm transition-all duration-200 hover:bg-rose-light"
          >
            Iniciar sesión
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <article
            key={c.title}
            className="rounded-2xl border border-line bg-warm p-6 shadow-card transition-all duration-200 hover:border-rose hover:shadow-card-hover"
          >
            <div className="text-3xl" aria-hidden="true">
              {c.emoji}
            </div>
            <h2 className="mt-3 font-display text-lg text-ink">{c.title}</h2>
            <p className="mt-2 text-sm text-stone">{c.text}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8">
        <h2 className="text-center font-display text-xl text-ink">Recursos recientes</h2>
        <ul className="mt-6 space-y-4">
          {resources.map((r) => (
            <li
              key={r.title}
              className="flex flex-col gap-3 rounded-2xl border border-line bg-warm p-4 shadow-card sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-olive">{r.type}</span>
                <p className="font-medium text-ink">{r.title}</p>
              </div>
              <button
                type="button"
                className="rounded-xl bg-rose-light px-4 py-2 text-sm font-medium text-rose-dark transition-all duration-200 hover:bg-rose"
              >
                Descargar
              </button>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-auto border-t border-line bg-warm py-6 text-center text-sm text-stone">
        © 2025 Apple Pie · Hecho con 💜 para ingenieras
      </footer>
    </div>
  )
}
