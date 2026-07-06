import { forwardRef, useCallback } from 'react'
import { sanitizeText } from '../../utils/sanitize'

const InputField = forwardRef(function InputField(
  { label, error, helperText, type = 'text', id, className = '', onChange, onBlur, ...props },
  ref,
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  const handleBlur = useCallback((e) => {
    if (type !== 'password' && type !== 'file' && onChange) {
      const sanitized = sanitizeText(e.target.value)
      if (sanitized !== e.target.value) {
        onChange({ ...e, target: { ...e.target, value: sanitized } })
        e.target.value = sanitized
      }
    }
    onBlur?.(e)
  }, [type, onChange, onBlur])

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        onChange={onChange}
        onBlur={handleBlur}
        className={`rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300'
        } ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  )
})

export default InputField
