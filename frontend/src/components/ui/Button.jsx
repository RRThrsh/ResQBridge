import Spinner from './Spinner.jsx'

const variants = {
  primary:
    'bg-green-700 text-white hover:bg-green-800 focus:ring-green-500 shadow-sm',

  secondary:
    'bg-slate-800 text-white hover:bg-slate-900 focus:ring-slate-500 shadow-sm',

  outline:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-500',

  success:
    'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-sm',

  warning:
    'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500 shadow-sm',

  danger:
    'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm',

  info:
    'bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500 shadow-sm',

  ghost:
    'text-slate-600 hover:bg-slate-100 focus:ring-slate-500',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  children,
  className = '',
  ...props
}) {
  const buttonVariant = variants[variant] || variants.primary

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-xl font-medium
        transition-all duration-200
        active:scale-[0.98]
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${buttonVariant}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {isLoading && <Spinner size="sm" />}
      {children}
    </button>
  )
}