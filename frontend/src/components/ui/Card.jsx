export default function Card({
  children,
  className = '',
  padding = true,
  hover = false,
}) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white shadow-sm ${
        padding ? 'p-6' : ''
      } ${hover ? 'transition-shadow hover:shadow-md' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
