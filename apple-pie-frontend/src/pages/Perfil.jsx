import { useAuth } from '../context/AuthContext.jsx'

export default function Perfil() {
  const { user } = useAuth()
  const nombre = user?.nombre ?? user?.name ?? '—'
  const email = user?.email ?? '—'

  return (
    <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm dark:bg-gray-900">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Mi perfil</h1>
      <dl className="mt-6 space-y-4 text-sm">
        <div>
          <dt className="font-medium text-gray-500 dark:text-gray-400">Nombre</dt>
          <dd className="mt-1 text-gray-900 dark:text-white">{nombre}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500 dark:text-gray-400">Correo</dt>
          <dd className="mt-1 text-gray-900 dark:text-white">{email}</dd>
        </div>
      </dl>
    </div>
  )
}
