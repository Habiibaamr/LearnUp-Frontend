import { Link } from 'react-router-dom'
import { routePaths } from '../../utils/routePaths'
import learnupLogo from '../../assets/learnup-logo.png'

function BrandMark({ subtitle = 'Student-first learning management platform' }) {
  return (
    <Link className="brand-mark" to={routePaths.login}>
      <img src={learnupLogo} alt="LearnUp" className="learnup-logo" />
      <span>
        <span className="brand-mark__subtitle">{subtitle}</span>
      </span>
    </Link>
  )
}

export default BrandMark
