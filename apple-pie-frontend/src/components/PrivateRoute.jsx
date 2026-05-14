import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function PrivateRoute() {
  const { token, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2] dark:bg-gray-950">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-[#F9C5D1] border-t-[#6C63FF]"
          role="status"
          aria-label="Cargando"
        />
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
