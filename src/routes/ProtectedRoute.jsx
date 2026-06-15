import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { buildAuthRoute, routePaths } from '../utils/routePaths'

function ProtectedRoute() {
  const location = useLocation()
  const { isAuthenticated, selectedRole } = useAuth()

  if (!isAuthenticated) {
    return (
      <Navigate
        to={buildAuthRoute(routePaths.login, selectedRole)}
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  return <Outlet />
}

export default ProtectedRoute
