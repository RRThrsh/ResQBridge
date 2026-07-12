import useInView from '../../hooks/useInView'

const variants = {
  'fade-up': 'translate-y-10',
  'fade-down': '-translate-y-10',
  'fade-left': 'translate-x-10',
  'fade-right': '-translate-x-10',
  'scale-up': 'scale-90',
}

export default function AnimateIn({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 700,
  className = '',
  as: Tag = 'div',
}) {
  const [ref, inView] = useInView()

  return (
    <Tag
      ref={ref}
      className={`transition-all ease-out ${inView ? 'translate-y-0 translate-x-0 scale-100 opacity-100' : `opacity-0 ${variants[animation] || variants['fade-up']}`} ${className}`}
      style={{ transitionDuration: `${duration}ms`, transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}
