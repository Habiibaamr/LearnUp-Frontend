function TextInput({
  label,
  hint,
  error,
  multiline = false,
  className = '',
  ...props
}) {
  const Field = multiline ? 'textarea' : 'input'

  return (
    <label className={`field ${className}`.trim()}>
      <span className="field__label">{label}</span>
      {hint ? <span className="field__hint">{hint}</span> : null}
      <Field className={`field__control ${error ? 'field__control--error' : ''}`} {...props} />
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  )
}

export default TextInput
