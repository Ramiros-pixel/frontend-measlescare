import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth, isAdmin } from '@/auth/AuthContext'
import { FullPageLoader } from '@/components/ui/Loaders'

export function RequireAuth({ requireAdmin = false }: { requireAdmin?: boolean }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullPageLoader label="Memeriksa sesi" />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (requireAdmin && !isAdmin(user)) return <Navigate to="/beranda" replace />
  return <Outlet />
}

export function PublicOnly() {
  const { user, loading } = useAuth()
  if (loading) return <FullPageLoader label="Memeriksa sesi" />
  if (user) return <Navigate to={isAdmin(user) ? '/admin' : '/beranda'} replace />
  return <Outlet />
}
