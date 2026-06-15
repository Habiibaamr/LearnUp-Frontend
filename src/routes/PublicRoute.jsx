import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { getRoleHomePath } from '../utils/routePaths'

function PublicRoute() {
  const { isAuthenticated, session } = useAuth()

  if (isAuthenticated && session) {
    return <Navigate to={getRoleHomePath(session.role)} replace />
  }

  return <Outlet />
}

export default PublicRoute
