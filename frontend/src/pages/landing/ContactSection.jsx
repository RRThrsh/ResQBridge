import { Button } from '../../components/ui'

export default function ContactSection() {
  return (
    <section className="border-t border-gray-100 px-6 py-16 sm:px-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-light text-gray-900 sm:text-3xl">Contact Us</h2>
        <p className="mt-2 text-sm text-gray-400">
          Reach out for rescues, inquiries, or to lend a hand.
        </p>

        <div className="mt-8 grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
              <p className="text-xs font-semibold tracking-wide text-red-600 uppercase">Emergency Hotline</p>
              <p className="mt-2 text-2xl font-bold text-red-700">+63 (48) 123-4567</p>
              <p className="mt-1 text-sm text-red-500">Available 24/7 for wildlife emergencies</p>
            </div>

            <div className="mt-6 space-y-5 text-sm">
              <div>
                <p className="font-medium text-gray-700">Non-Emergency</p>
                <p className="mt-0.5 text-gray-500">+63 (48) 434-1234</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Email</p>
                <p className="mt-0.5 text-gray-500">rescue@palawanwildlife.org</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Follow Us</p>
                <div className="mt-1.5 flex gap-3">
                  {['Facebook', 'Instagram', 'Twitter'].map((s) => (
                    <span key={s} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-500 transition hover:border-gray-300 hover:text-gray-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs italic text-gray-400">
                We respond to non-emergency messages within 24 hours.
              </p>
            </div>
          </div>

          <div className="lg:col-span-3">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input type="text" className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500" placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <select className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500">
                  <option>Report an Animal</option>
                  <option>Volunteer</option>
                  <option>Donation</option>
                  <option>General Inquiry</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <textarea rows={4} className="mt-1 w-full resize-y rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500" placeholder="Tell us how we can help..." />
              </div>
              <Button type="submit" className="w-full sm:w-auto">Send Message</Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
