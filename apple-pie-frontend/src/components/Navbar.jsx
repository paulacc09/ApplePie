import { useAuth } from '../context/AuthContext.jsx'
import LogoApplePie from './LogoApplePie.jsx'

function displayName(user) {
  if (!user) return ''
  return user.nombre ?? user.name ?? user.email ?? ''
}

function initialLetter(user) {
  const n = displayName(user).trim()
  if (!n) return '?'
  return n.charAt(0).toUpperCase()
}

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth()

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center gap-3 border-b border-line bg-warm px-4 shadow-sm md:gap-4 md:px-6">
      <button
        type="button"
        className="shrink-0 rounded-xl p-2 text-ink transition-all duration-200 hover:bg-rose-light md:hidden"
        onClick={onToggleSidebar}
        aria-label="Abrir menú"
      >
        <span className="text-xl" aria-hidden="true">
          ☰
        </span>
      </button>

      <div className="hidden shrink-0 md:block">
        <LogoApplePie to="/home" compact />
      </div>

      <div className="flex flex-1 justify-center md:hidden">
        <span className="text-2xl" aria-hidden="true">
          🍎
        </span>
      </div>

      <div className="hidden flex-1 justify-center px-4 md:flex">
        <label htmlFor="nav-search" className="sr-only">
          Buscar
        </label>
        <input
          id="nav-search"
          type="search"
          placeholder="Buscar comunidades, recursos..."
          className="w-full max-w-md rounded-full border-0 bg-cream px-4 py-2 text-sm text-ink shadow-sm ring-1 ring-transparent transition-all duration-200 placeholder:text-faded focus:outline-none focus:ring-rose"
        />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <div className="relative shrink-0" title={displayName(user)}>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-rose text-sm font-semibold text-ink"
            aria-label={`Usuario: ${displayName(user) || 'Invitada'}`}
          >
            {initialLetter(user)}
          </div>
          <span
            className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose text-[8px] font-bold text-ink"
            aria-label="Notificaciones"
          >
            2
          </span>
        </div>

        <button
          type="button"
          onClick={logout}
          className="hidden rounded-xl px-3 py-2 text-sm font-medium text-stone transition-all duration-200 hover:bg-rose-light hover:text-rose-dark sm:inline"
        >
          Salir
        </button>
      </div>
    </header>
  )
}
