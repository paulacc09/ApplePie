export default function MiAgenda() {
  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  const dates = [12, 13, 14, 15, 16, 17, 18]

  return (
    <div className="rounded-2xl border border-line bg-warm p-6 shadow-card md:p-8">
      <div className="flex items-center justify-between">
        <button type="button" className="text-lg text-rose-dark">
          ‹
        </button>
        <h1 className="font-display text-xl text-ink">Mayo 2026</h1>
        <button type="button" className="text-lg text-rose-dark">
          ›
        </button>
      </div>
      <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs text-faded">
        {days.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-2 text-center text-sm">
        {dates.map((d) => (
          <button
            key={d}
            type="button"
            className={`rounded-full py-2 transition-colors ${
              d === 15 ? 'bg-rose text-white' : 'text-ink hover:bg-rose-light'
            }`}
          >
            {d}
          </button>
        ))}
      </div>
      <div className="mt-8 space-y-3">
        <div className="rounded-lg border-l-4 border-rose bg-rose-light px-3 py-2">
          <span className="text-xs font-medium text-rose-dark">Sesión grupal</span>
          <p className="text-sm text-ink">Parcial 2 — 18:00</p>
        </div>
        <div className="rounded-lg border-l-4 border-olive bg-mint px-3 py-2">
          <span className="text-xs font-medium text-olive">Taller</span>
          <p className="text-sm text-ink">Técnicas de estudio — 11:00</p>
        </div>
      </div>
      <button
        type="button"
        className="mt-8 w-full rounded-xl bg-rose px-5 py-2.5 text-sm font-medium text-ink shadow-sm hover:bg-rose-dark"
      >
        CREAR EVENTO
      </button>
    </div>
  )
}
