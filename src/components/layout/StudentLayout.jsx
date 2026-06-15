import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import BrandMark from '../common/BrandMark'
import AppButton from '../common/AppButton'
import { useAuth } from '../../context/useAuth'
import { studentNavigation } from '../../utils/routePaths'
import { getInitials } from '../../utils/formatters'
import { clearCurrentSession } from '../../utils/learnupRecords.js'

function StudentLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()

  const activeNavItem =
    studentNavigation.find((item) => location.pathname.startsWith(item.matchPrefix)) ??
    studentNavigation[0]

  function handleLogout() {
    clearCurrentSession()
    logout()
    navigate('/login')
  }

  return (
    <div className="student-shell">
      <button
        className={`student-shell__overlay ${menuOpen ? 'is-visible' : ''}`}
        type="button"
        aria-label="Close navigation"
        onClick={() => setMenuOpen(false)}
      />

      <aside className={`student-sidebar ${menuOpen ? 'is-open' : ''}`}>
        <div className="student-sidebar__top">
          <BrandMark subtitle="Student dashboard" />
          <button
            className="student-sidebar__close"
            type="button"
            onClick={() => setMenuOpen(false)}
          >
            Close
          </button>
        </div>

        <nav className="student-sidebar__nav" aria-label="Student navigation">
          {studentNavigation.map((item) => {
            const isActive = location.pathname.startsWith(item.matchPrefix)

            return (
              <NavLink
                key={item.to}
                className={`student-sidebar__link ${isActive ? 'is-active' : ''}`}
                to={item.to}
                onClick={() => setMenuOpen(false)}
              >
                <span className="student-sidebar__link-label">{item.label}</span>
                <span className="student-sidebar__link-short">{item.shortLabel}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="student-sidebar__profile">
          <span className="student-sidebar__avatar">{getInitials(currentUser?.fullName)}</span>
          <div>
            <strong>{currentUser?.fullName ?? 'Student User'}</strong>
            <span>{currentUser?.email ?? 'student@learnup.dev'}</span>
          </div>
        </div>
      </aside>

      <main className="student-main">
        <header className="student-topbar">
          <div>
            <p className="student-topbar__eyebrow">Student workspace</p>
            <h1>{activeNavItem.label}</h1>
          </div>

          <div className="student-topbar__actions">
            <button className="menu-button" type="button" onClick={() => setMenuOpen(true)}>
              Menu
            </button>
            <div className="student-topbar__user">
              <span className="student-topbar__avatar">{getInitials(currentUser?.fullName)}</span>
              <div>
                <strong>{currentUser?.fullName ?? 'Student User'}</strong>
                <span>{currentUser?.level ?? 'Level 4'}</span>
              </div>
            </div>
            <AppButton variant="ghost" onClick={handleLogout}>
              Logout
            </AppButton>
          </div>
        </header>

        <div className="student-main__content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default StudentLayout
