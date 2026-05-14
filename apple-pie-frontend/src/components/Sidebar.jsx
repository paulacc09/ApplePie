import { NavLink } from 'react-router-dom'

const links = [
  { to: '/home', label: 'Inicio', emoji: '🏠' },
  { to: '/comunidades', label: 'Comunidades', emoji: '👥' },
  { to: '/repositorio', label: 'Repositorio', emoji: '📁' },
  { to: '/foro', label: 'Foro', emoji: '💬' },
  { to: '/mentoria', label: 'Mentorías', emoji: '🎓' },
  { to: '/agenda', label: 'Mi Agenda', emoji: '📅' },
  { to: '/perfil', label: 'Mi Perfil', emoji: '👤' },
]

function linkClass({ isActive }) {
  const base =
    'mx-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6C63FF]'
  if (isActive) {
    return `${base} bg-[#F9C5D1] font-medium text-[#6C63FF] dark:bg-gray-800 dark:text-[#a8a3ff]`
  }
  return `${base} text-gray-700 hover:bg-[#FAF7F2] dark:text-gray-200 dark:hover:bg-gray-800`
}

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <button
        type="button"
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-label="Cerrar menú"
        onClick={onClose}
      />

      <aside
        className={`fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 overflow-y-auto border-r border-[#F9C5D1] bg-white transition-transform duration-200 dark:border-gray-800 dark:bg-gray-900 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        aria-hidden={!open ? 'true' : undefined}
      >
        <nav className="flex flex-col py-4" aria-label="Principal">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} onClick={onClose}>
              <span aria-hidden="true">{l.emoji}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
