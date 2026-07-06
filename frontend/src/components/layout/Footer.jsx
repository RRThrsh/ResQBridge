import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link to="/" className="text-xl font-bold text-green-600">
              ResQBridge
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-gray-500">
              A community-driven platform connecting wildlife rescue teams, volunteers, and concerned citizens across Palawan.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Quick Links</h3>
            <ul className="mt-4 space-y-3">
              {[
                { label: 'Home', to: '/' },
                { label: 'About', to: '/about' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-gray-500 transition-colors hover:text-green-600">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm text-gray-500">
              <li>+63 (48) 123-4567</li>
              <li>rescue@palawanwildlife.org</li>
              <li>Puerto Princesa City, Palawan</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} ResQBridge. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
