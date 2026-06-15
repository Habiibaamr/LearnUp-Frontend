function resolveTone(status) {
  const normalizedStatus = status.toLowerCase()

  if (
    normalizedStatus.includes('excellent') ||
    normalizedStatus.includes('present') ||
    normalizedStatus.includes('on track') ||
    normalizedStatus.includes('read')
  ) {
    return 'success'
  }

  if (
    normalizedStatus.includes('late') ||
    normalizedStatus.includes('upcoming') ||
    normalizedStatus.includes('needs')
  ) {
    return 'warning'
  }

  if (normalizedStatus.includes('absent') || normalizedStatus.includes('unread')) {
    return 'danger'
  }

  return 'info'
}

function StatusPill({ status, tone }) {
  const pillTone = tone ?? resolveTone(status)

  return <span className={`status-pill status-pill--${pillTone}`}>{status}</span>
}

export default StatusPill
