import { Link } from 'react-router-dom'

function AppButton({
  children,
  to,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}) {
  const classes = [
    'app-button',
    `app-button--${variant}`,
    `app-button--${size}`,
    fullWidth ? 'app-button--full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (to) {
    return (
      <Link className={classes} to={to} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  )
}

export default AppButton
