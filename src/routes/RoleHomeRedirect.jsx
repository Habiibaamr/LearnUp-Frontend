import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { buildAuthRoute, getRoleHomePath, routePaths } from '../utils/routePaths'

function RoleHomeRedirect() {
  const { session, selectedRole } = useAuth()

  if (!session) {
    return <Navigate to={buildAuthRoute(routePaths.login, selectedRole)} replace />
  }

  return <Navigate to={getRoleHomePath(session.role)} replace />
}

export default RoleHomeRedirect
