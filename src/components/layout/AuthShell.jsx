import BrandMark from '../common/BrandMark'
import SurfaceCard from '../common/SurfaceCard'
import { roleContent } from '../../data/roleOptions'

function AuthShell({ role, title, description, footer, children }) {
  const content = roleContent[role] ?? roleContent.student

  return (
    <div className="auth-shell">
      <div className="auth-shell__panel">
        <BrandMark subtitle="Modern LMS experience for every role" />
        <div className="auth-shell__hero">
          <span className="eyebrow">Selected role</span>
          <h1>{content.heading}</h1>
          <p>{content.body}</p>
        </div>
        <div className="auth-shell__stats">
          <div>
            <strong>Student demo</strong>
            <span>
              <code>student@learnup.dev</code> / <code>LearnUp123</code>
            </span>
          </div>
          <div>
            <strong>Routing ready</strong>
            <span>Public and protected route flows are already separated.</span>
          </div>
          <div>
            <strong>Local auth only</strong>
            <span>No backend required at this stage.</span>
          </div>
        </div>
      </div>

      <div className="auth-shell__content">
        <SurfaceCard className="auth-card" accent="frosted">
          <div className="auth-card__header">
            <span className="eyebrow">{role}</span>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <div className="auth-card__body">{children}</div>
          {footer ? <div className="auth-card__footer">{footer}</div> : null}
        </SurfaceCard>
      </div>
    </div>
  )
}

export default AuthShell
