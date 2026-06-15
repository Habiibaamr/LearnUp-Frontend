import AppButton from '../../components/common/AppButton'
import BrandMark from '../../components/common/BrandMark'
import SurfaceCard from '../../components/common/SurfaceCard'
import { routePaths } from '../../utils/routePaths'

function NotFoundPage() {
  return (
    <div className="standalone-page">
      <div className="standalone-page__inner">
        <BrandMark subtitle="Page not found" />
        <SurfaceCard className="standalone-card">
          <span className="eyebrow">404</span>
          <h1>The page you requested is not available.</h1>
          <p>
            The route may have changed while the project was being rebuilt. Head back to login
            and continue from your dashboard.
          </p>
          <div className="inline-actions">
            <AppButton to={routePaths.login}>Go to login</AppButton>
            <AppButton to={routePaths.roleHome} variant="secondary">
              Try my dashboard
            </AppButton>
          </div>
        </SurfaceCard>
      </div>
    </div>
  )
}

export default NotFoundPage
