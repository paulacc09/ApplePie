import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function PrivateRoute({ allowedRoles }) {
  const { token, loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-rose-light border-t-rose-dark"
          role="status"
          aria-label="Cargando"
        />
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(user?.rol)) {
    return <Navigate to="/home" replace />
  }

  return <Outlet />
}
