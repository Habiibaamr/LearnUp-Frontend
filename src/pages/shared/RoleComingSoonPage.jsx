import { useNavigate } from 'react-router-dom'
import AppButton from '../../components/common/AppButton'
import BrandMark from '../../components/common/BrandMark'
import SurfaceCard from '../../components/common/SurfaceCard'
import { useAuth } from '../../context/useAuth'
import { routePaths } from '../../utils/routePaths'

function RoleComingSoonPage() {
  const navigate = useNavigate()
  const { logout, session } = useAuth()

  function handleReturnToLogin() {
    logout()
    navigate(routePaths.login, { replace: true })
  }

  return (
    <div className="standalone-page">
      <div className="standalone-page__inner">
        <BrandMark subtitle="Role expansion is easy from this shared foundation" />
        <SurfaceCard className="standalone-card" accent="highlight">
          <span className="eyebrow">Coming next</span>
          <h1>{session?.role ?? 'This'} dashboard is not built yet.</h1>
          <p>
            The auth flow for this role already works, but the main dashboard pages are still
            intentionally focused on the student side first.
          </p>
          <div className="inline-actions">
            <AppButton onClick={handleReturnToLogin}>Back to login</AppButton>
            <AppButton to={routePaths.login} variant="secondary">
              Use another account
            </AppButton>
          </div>
        </SurfaceCard>
      </div>
    </div>
  )
}

export default RoleComingSoonPage
