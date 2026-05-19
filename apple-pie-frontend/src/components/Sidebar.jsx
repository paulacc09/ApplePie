import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const linksBefore = [
  { to: '/home', label: 'Inicio', emoji: '🏠' },
  { to: '/comunidades', label: 'Comunidades', emoji: '👥' },
  { to: '/repositorio', label: 'Repositorio', emoji: '📁' },
  { to: '/foro', label: 'Foro', emoji: '💬' },
]

const linksAfter = [
  { to: '/mentoria', label: 'Mentorías', emoji: '🎓' },
  { to: '/agenda', label: 'Mi Agenda', emoji: '📅' },
  { to: '/perfil', label: 'Mi Perfil', emoji: '👤' },
]

const navSectionsByRole = {
  estudiante: [linksBefore, linksAfter],
  mentora: [
    [
      { to: '/mentora/dashboard', label: 'Inicio', emoji: '🏠' },
      { to: '/mentora/agenda', label: 'Agenda', emoji: '📅' },
      { to: '/mentora/materiales', label: 'Recursos', emoji: '📎' },
      { to: '/mentora/perfil', label: 'Perfil', emoji: '👤' },
    ],
  ],
  moderadora: [
    [
      { to: '/moderadora/reportes', label: 'Reportes Activos', emoji: '💬' },
      { to: '/moderadora/historial', label: 'Historial', emoji: '📊' },
      { to: '/moderadora/comunidades', label: 'Comunidades', emoji: '👥' },
    ],
  ],
  admin: [
    [
      { to: '/admin/dashboard', label: 'Inicio', emoji: '🏠' },
      { to: '/admin/usuarios', label: 'Agenda/Usuarias', emoji: '👥' },
      { to: '/admin/pagos', label: 'Pagos y Planes', emoji: '📁' },
      { to: '/perfil', label: 'Perfil', emoji: '👤' },
    ],
  ],
}

function linkClass({ isActive }) {
  const base =
    'mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose'
  if (isActive) {
    return `${base} bg-rose-light font-medium text-rose-dark`
  }
  return `${base} text-stone hover:bg-rose-light hover:text-rose-dark`
}

function NavBlock({ links, onClose }) {
  return (
    <>
      {links.map((l) => (
        <NavLink key={l.to} to={l.to} className={linkClass} onClick={onClose}>
          <span className="text-lg" aria-hidden="true">
            {l.emoji}
          </span>
          {l.label}
        </NavLink>
      ))}
    </>
  )
}

function NavSections({ sections, onClose }) {
  return (
    <>
      {sections.map((links, idx) => (
        <div key={links.map((l) => l.to).join('|')}>
          {idx > 0 ? <div className="my-4 border-t border-line" /> : null}
          <NavBlock links={links} onClose={onClose} />
        </div>
      ))}
    </>
  )
}

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth()
  const navSections = navSectionsByRole[user?.rol] ?? navSectionsByRole.estudiante

  return (
    <>
      <button
        type="button"
        className={`fixed inset-0 z-40 bg-ink/30 transition-opacity md:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-label="Cerrar menú"
        onClick={onClose}
      />

      <aside
        className={`fixed left-0 top-16 z-50 hidden h-[calc(100vh-4rem)] w-60 flex-col overflow-y-auto border-r border-line bg-warm transition-transform duration-200 md:flex ${
          open ? '' : ''
        }`}
        aria-label="Navegación lateral"
      >
        <nav className="flex flex-col px-3 py-6" aria-label="Principal">
          <NavSections sections={navSections} onClose={onClose} />
        </nav>
      </aside>

      <aside
        className={`fixed left-0 top-16 z-50 flex h-[calc(100vh-4rem)] w-60 flex-col overflow-y-auto border-r border-line bg-warm shadow-card transition-transform duration-200 md:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <nav className="flex flex-col px-3 py-6" aria-label="Principal móvil">
          <NavSections sections={navSections} onClose={onClose} />
        </nav>
      </aside>
    </>
  )
}
