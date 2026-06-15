function SurfaceCard({ children, className = '', accent = 'default' }) {
  return (
    <section className={`surface-card surface-card--${accent} ${className}`.trim()}>
      {children}
    </section>
  )
}

export default SurfaceCard
