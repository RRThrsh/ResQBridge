import { useState, useEffect } from 'react'
import AboutSkeleton from './AboutSkeleton'

const API_BASE = '/api/v1'

export default function About() {
  const [config, setConfig] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/landing-config`)
      .then((r) => r.json())
      .then((d) => {
        if (d.config?.about) setConfig(d.config.about)
        else setConfig({})
      })
      .catch(() => setConfig({}))
  }, [])

  if (config === null) return <AboutSkeleton />

  const title = config?.title || 'About Us'
  const subtitle = config?.subtitle || 'Palawan Wildlife Rescue & Conservation Center'
  const description = config?.description || ''
  const mission = config?.mission || ''
  const vision = config?.vision || ''
  const paragraphs = description.split('\n\n').filter(Boolean)

  return (
    <div className="px-6 py-16 sm:px-8 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-gray-500">{subtitle}</p>

        {paragraphs.length > 0 && (
          <div className="mt-10 space-y-6 text-sm leading-relaxed text-gray-600">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}

        {(mission || vision) && (
          <>
            <hr className="my-10 border-gray-200" />
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Mission &amp; Vision</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {mission && (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-base font-semibold text-gray-900">Mission</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{mission}</p>
                </div>
              )}
              {vision && (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-base font-semibold text-gray-900">Vision</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{vision}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
