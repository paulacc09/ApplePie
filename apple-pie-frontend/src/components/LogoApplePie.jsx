import { Link } from 'react-router-dom'

export default function LogoApplePie({ to, className = '', compact = false }) {
  const inner = (
    <div className={`flex flex-col items-center ${className}`}>
      <span
        className={`font-display italic text-rose-dark ${compact ? 'text-lg md:text-xl' : 'text-2xl md:text-3xl'}`}
      >
        apple pie
      </span>
      <span
        className={`mt-0.5 font-sans font-medium uppercase tracking-widest text-faded ${compact ? 'text-[8px] md:text-[9px]' : 'text-xs'}`}
      >
        comunidad de chicas en ingeniería
      </span>
    </div>
  )

  if (to) {
    return (
      <Link to={to} className="inline-flex focus-visible:outline-none" aria-label="Apple Pie — inicio">
        {inner}
      </Link>
    )
  }

  return inner
}
