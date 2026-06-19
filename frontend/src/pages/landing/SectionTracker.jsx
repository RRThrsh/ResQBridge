import { useSectionTracking } from '../../context/SessionContext'

export default function SectionTracker({ name, children }) {
  const ref = useSectionTracking(name)
  return <div ref={ref}>{children}</div>
}
