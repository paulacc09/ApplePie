import { useAuth } from '../context/AuthContext.jsx'

export default function Perfil() {
  const { user } = useAuth()
  const nombre = user?.nombre ?? user?.name ?? '—'
  const email = user?.email ?? '—'

  return (
    <div className="rounded-2xl border border-line bg-warm p-8 shadow-card">
      <h1 className="font-display text-2xl text-ink">Mi perfil</h1>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-cream p-4">
          <dt className="text-xs font-semibold uppercase tracking-wider text-olive">Nombre</dt>
          <dd className="mt-1 font-medium text-ink">{nombre}</dd>
        </div>
        <div className="rounded-xl border border-line bg-cream p-4">
          <dt className="text-xs font-semibold uppercase tracking-wider text-olive">Correo</dt>
          <dd className="mt-1 font-medium text-ink">{email}</dd>
        </div>
      </dl>
    </div>
  )
}
