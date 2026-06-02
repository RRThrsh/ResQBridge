import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function useScrollToHash() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    // Scroll to top on route change if no hash
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Attempt to find the element
    const id = hash.replace('#', '')
    const element = document.getElementById(id)
    if (element) {
      // Offset for fixed navbar
      const yOffset = -80
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }, [pathname, hash])
}
