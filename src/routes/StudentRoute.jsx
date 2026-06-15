import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { routePaths } from '../utils/routePaths'

function StudentRoute() {
  const { session } = useAuth()

  if (session?.role !== 'student') {
    return <Navigate to={routePaths.comingSoon} replace />
  }

  return <Outlet />
}

export default StudentRoute
