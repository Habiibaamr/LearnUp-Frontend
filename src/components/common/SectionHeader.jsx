function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <header className="section-header">
      <div>
        {eyebrow ? <p className="section-header__eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {description ? <p className="section-header__description">{description}</p> : null}
      </div>
      {action ? <div className="section-header__action">{action}</div> : null}
    </header>
  )
}

export default SectionHeader
