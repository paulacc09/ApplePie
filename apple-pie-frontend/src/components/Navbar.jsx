import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

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
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center gap-4 border-b border-[#F9C5D1] bg-white px-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:px-6">
      <button
        type="button"
        className="rounded-xl p-2 transition-all duration-200 hover:bg-[#FAF7F2] dark:hover:bg-gray-800 md:hidden"
        onClick={onToggleSidebar}
        aria-label="Abrir menú de navegación"
      >
        <span className="text-xl" aria-hidden="true">
          ☰
        </span>
      </button>

      <div className="font-serif text-lg font-semibold tracking-tight text-[#6C63FF] dark:text-[#a8a3ff]">
        <span aria-hidden="true">🍎</span>{' '}
        <span className="font-sans font-medium">apple pie</span>
      </div>

      <div className="mx-auto hidden max-w-md flex-1 md:block">
        <label htmlFor="nav-search" className="sr-only">
          Buscar
        </label>
        <input
          id="nav-search"
          type="search"
          placeholder="Buscar..."
          className="w-full rounded-full border border-[#F9C5D1] bg-[#FFF8F0] px-4 py-2 text-sm text-gray-800 transition-all duration-200 placeholder:text-gray-400 focus:border-[#6C63FF] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-full border border-transparent p-2 transition-all duration-200 hover:bg-[#FAF7F2] dark:hover:bg-gray-800"
          aria-label="Cambiar tema"
        >
          <span className="text-lg" aria-hidden="true">
            {theme === 'dark' ? '☀️' : '🌙'}
          </span>
        </button>

        <div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F9C5D1] text-sm font-semibold text-[#6C63FF] dark:bg-gray-700 dark:text-[#c4b5fd]"
          title={displayName(user)}
          aria-label={`Usuario: ${displayName(user) || 'Invitada'}`}
        >
          {initialLetter(user)}
        </div>

        <button
          type="button"
          onClick={logout}
          className="hidden rounded-xl px-3 py-2 text-sm text-gray-600 transition-all duration-200 hover:bg-[#FAF7F2] dark:text-gray-300 dark:hover:bg-gray-800 sm:inline"
        >
          Salir
        </button>
      </div>
    </header>
  )
}
