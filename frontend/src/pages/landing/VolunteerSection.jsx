import { Link } from 'react-router-dom'
import { Button } from '../../components/ui'

const ROLES_ICONS = [
  'M12 2l-3 7h-7l5.5 4.5L6 21l6-4.5L18 21l-1.5-7.5L22 9h-7L12 2z',
  'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  'M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2m8-10a4 4 0 11-8 0 4 4 0 018 0z',
  'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
]

export default function VolunteerSection({ title, subtitle, roles, requirements, cta }) {
  return (
    <section className="border-t border-gray-100 px-6 py-16 sm:px-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-light text-gray-900 sm:text-3xl">{title}</h2>
        <p className="mt-2 text-sm text-gray-400">{subtitle}</p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((r, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <svg className="h-5 w-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ROLES_ICONS[i % ROLES_ICONS.length]} />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-semibold text-gray-900">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{r.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
          <h3 className="text-base font-semibold text-gray-900">Requirements</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {req}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 text-center">
          <Link to={cta?.link || '/report'}>
            <Button size="lg">{cta?.label || 'Apply to Volunteer'}</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
