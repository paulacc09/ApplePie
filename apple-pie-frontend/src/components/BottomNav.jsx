import { NavLink } from 'react-router-dom'

const items = [
  { to: '/home', label: 'Inicio', icon: '🏠' },
  { to: '/comunidades', label: 'Comunidades', icon: '👥' },
  { to: '/repositorio', label: 'Repositorio', icon: '📁' },
  { to: '/mentoria', label: 'Mentorías', icon: '🎓' },
  { to: '/perfil', label: 'Perfil', icon: '👤' },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-line bg-warm px-4 md:hidden"
      aria-label="Navegación principal"
    >
      {items.map(({ to, label, icon }) => (
        <NavLink key={to} to={to} className="flex flex-col items-center gap-0.5 focus-visible:outline-none">
          {({ isActive }) => (
            <div
              className={`flex flex-col items-center text-xs transition-colors duration-200 ${
                isActive ? 'text-rose-dark' : 'text-faded hover:text-stone'
              }`}
            >
              <span className="text-lg" aria-hidden="true">
                {icon}
              </span>
              <span>{label}</span>
              <span
                className={`mt-0.5 h-1 w-1 rounded-full ${isActive ? 'bg-rose-dark' : 'bg-transparent'}`}
                aria-hidden="true"
              />
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
