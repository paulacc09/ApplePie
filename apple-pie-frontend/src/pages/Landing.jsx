import { Link } from 'react-router-dom'

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
    <div className="flex min-h-screen flex-col overflow-y-auto">
      <nav className="flex items-center justify-between border-b border-[#F9C5D1] bg-white/80 px-4 py-4 shadow-sm backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/90 md:px-10">
        <div className="font-serif text-lg font-semibold text-[#6C63FF] dark:text-[#a8a3ff]">
          <span aria-hidden="true">🍎</span> apple pie
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Link
            to="/login"
            className="rounded-full border border-[#F9C5D1] px-4 py-2 text-sm font-medium text-[#6C63FF] transition-all duration-200 hover:bg-[#FAF7F2] dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/registro"
            className="rounded-full bg-[#6C63FF] px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-[#5855d6]"
          >
            Únete gratis
          </Link>
        </div>
      </nav>

      <section className="bg-gradient-to-b from-[#FAF7F2] to-[#FFF8F0] px-4 py-16 text-center dark:from-gray-950 dark:to-gray-900 md:py-24">
        <h1 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-white md:text-5xl">
          Comunidad de chicas en ingeniería
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 dark:text-gray-300 md:text-lg">
          Empoderando mujeres en ingeniería mediante el aprendizaje colaborativo
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/registro"
            className="rounded-2xl bg-[#6C63FF] px-8 py-3 font-medium text-white shadow-md transition-all duration-200 hover:bg-[#5855d6] hover:shadow-lg"
          >
            Únete gratis
          </Link>
          <Link
            to="/repositorio"
            className="rounded-2xl border border-[#A8B5A2] bg-white px-8 py-3 font-medium text-[#6C63FF] shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-600 dark:bg-gray-900 dark:text-[#a8a3ff]"
          >
            Ver recursos
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <article
            key={c.title}
            className="rounded-3xl bg-white p-6 shadow-md transition-all duration-200 hover:shadow-lg dark:bg-gray-900"
          >
            <div className="text-3xl" aria-hidden="true">
              {c.emoji}
            </div>
            <h2 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">{c.title}</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{c.text}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8">
        <h2 className="text-center text-xl font-semibold text-gray-900 dark:text-white">
          Recursos recientes
        </h2>
        <ul className="mt-6 space-y-4">
          {resources.map((r) => (
            <li
              key={r.title}
              className="flex flex-col gap-3 rounded-2xl border border-[#F9C5D1] bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <span className="text-xs font-medium uppercase text-[#A8B5A2]">{r.type}</span>
                <p className="font-medium text-gray-900 dark:text-white">{r.title}</p>
              </div>
              <button
                type="button"
                className="rounded-xl bg-[#F9C5D1] px-4 py-2 text-sm font-medium text-[#6C63FF] transition-all duration-200 hover:bg-[#f5b8c7] dark:bg-gray-800 dark:text-[#a8a3ff] dark:hover:bg-gray-700"
              >
                Descargar
              </button>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-auto border-t border-[#F9C5D1] bg-[#FFF8F0] py-6 text-center text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
        © 2025 Apple Pie · Hecho con 💜 para ingenieras
      </footer>
    </div>
  )
}
