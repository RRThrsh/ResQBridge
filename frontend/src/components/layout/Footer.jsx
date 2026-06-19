import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="text-xl font-bold text-green-600">
              ResQBridge
            </Link>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-gray-500">
              A community-driven platform connecting wildlife rescue teams, volunteers, and concerned citizens across Palawan.
            </p>
            <div className="mt-4 flex gap-3">
              {['Facebook', 'Instagram', 'Twitter'].map((s) => (
                <span key={s} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-500 transition hover:border-green-300 hover:text-green-600">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Pages</h3>
            <ul className="mt-3 space-y-2">
              {[
                { label: 'Home', to: '/' },
                { label: 'About', to: '/about' },
                { label: 'Wildlife Guide', to: '/wildlife-guide' },
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
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li>+63 (48) 123-4567</li>
              <li>rescue@palawanwildlife.org</li>
              <li>Irawan, Puerto Princesa City</li>
              <li>Palawan 5300, Philippines</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Emergency</h3>
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm">
              <span className="font-semibold text-red-700">24/7 Hotline</span>
              <br />
              <span className="text-lg font-bold text-red-700">+63 (48) 123-4567</span>
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} ResQBridge. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
