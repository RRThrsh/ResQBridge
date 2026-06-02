import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

/** Section ids on the home dashboard that map to navbar hash links */
export const HOME_NAV_SECTIONS = ['home', 'domestic', 'map', 'events'] as const
export type HomeNavSectionId = (typeof HOME_NAV_SECTIONS)[number]

export type NavLinkConfig = {
  label: string
  href: string
} & (
  | { type: 'home-section'; sectionId: HomeNavSectionId }
  | { type: 'route'; path: string }
)

export const NAV_LINKS: NavLinkConfig[] = [
  { label: 'Home', href: '/', type: 'home-section', sectionId: 'home' },
  { label: 'Domestic', href: '/#domestic', type: 'home-section', sectionId: 'domestic' },
  { label: 'Map', href: '/#map', type: 'home-section', sectionId: 'map' },
  { label: 'News', href: '/#events', type: 'home-section', sectionId: 'events' },
  { label: 'Wildlife', href: '/wildlife', type: 'route', path: '/wildlife' },
]

function sectionFromHash(hash: string): HomeNavSectionId | null {
  const id = hash.replace(/^#/, '')
  return (HOME_NAV_SECTIONS as readonly string[]).includes(id)
    ? (id as HomeNavSectionId)
    : null
}

export function useNavbarActive() {
  const { pathname, hash } = useLocation()
  const [activeSection, setActiveSection] = useState<HomeNavSectionId | null>(() => {
    if (pathname !== '/') return null
    return sectionFromHash(hash) ?? 'home'
  })

  const routeKey = `${pathname}|${hash}`
  const [prevRouteKey, setPrevRouteKey] = useState(routeKey)
  if (routeKey !== prevRouteKey) {
    setPrevRouteKey(routeKey)
    if (pathname !== '/') {
      setActiveSection(null)
    } else {
      setActiveSection(sectionFromHash(hash) ?? 'home')
    }
  }

  useEffect(() => {
    if (pathname !== '/') return

    const elements = HOME_NAV_SECTIONS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el != null,
    )
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (intersecting.length === 0) return

        const id = intersecting[0].target.id
        if ((HOME_NAV_SECTIONS as readonly string[]).includes(id)) {
          setActiveSection(id as HomeNavSectionId)
        }
      },
      {
        root: null,
        rootMargin: '-35% 0px -50% 0px',
        threshold: [0, 0.15, 0.35, 0.55, 0.75],
      },
    )

    for (const el of elements) {
      observer.observe(el)
    }
    return () => observer.disconnect()
  }, [pathname])

  function isNavLinkActive(link: NavLinkConfig): boolean {
    if (link.type === 'route') {
      return pathname === link.path
    }
    if (pathname !== '/') return false
    return activeSection === link.sectionId
  }

  function isPathActive(path: string): boolean {
    return pathname === path
  }

  return { isNavLinkActive, isPathActive, activeSection, pathname }
}
