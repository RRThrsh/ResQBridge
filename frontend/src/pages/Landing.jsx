import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Button, Modal, Badge } from '../components/ui'
import { GoogleMap, Marker, useLoadScript, Circle, Polyline } from '@react-google-maps/api'
import { useLocationContext } from '../context/LocationContext.jsx'

const slides = [
  {
    title: 'Wildlife Rescue',
    desc: 'Responding to injured and stranded animals across Palawan&#39;s forests and coastlines.',
    bg: 'from-emerald-600 to-green-800',
  },
  {
    title: 'Community Education',
    desc: 'Teaching local communities about wildlife protection and sustainable coexistence.',
    bg: 'from-amber-500 to-orange-700',
  },
  {
    title: 'Habitat Conservation',
    desc: 'Preserving critical habitats for Palawan&#39;s endemic and endangered species.',
    bg: 'from-teal-600 to-cyan-800',
  },
  {
    title: 'Marine Protection',
    desc: 'Safeguarding sea turtles, dugongs, and coral reefs through active patrols.',
    bg: 'from-blue-600 to-indigo-800',
  },
]

const stats = [
  { label: 'Rescues', value: '12K+' },
  { label: 'Teams', value: '500+' },
  { label: 'Countries', value: '30+' },
              { label: 'Response Time', value: '<5m' },
]

const categories = [
  { id: 'missing', title: 'Missing', color: 'bg-red-50 border-red-200 text-red-700', icon: 'M16 3h5m0 0v5m0-5l-6 6M4 14l-2 2m0 0l-2 2m2-2l2 2m-2-2l-2 2' },
  { id: 'found', title: 'Found', color: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: 'M5 13l4 4L19 7' },
]

const mockReports = {
  missing: [
    { id: 1, species: 'Philippine Eagle', location: 'Mount Mantalingajan', date: '2026-06-10', status: 'Active', desc: 'Last seen near the eastern ridge. Brown and white plumage, distinct crest.' },
    { id: 2, species: 'Palawan Bearcat', location: 'Cleopatra Needle', date: '2026-06-08', status: 'Active', desc: 'Young adult, spotted near forest edge. Distinctive long tail and dark coat.' },
    { id: 3, species: 'Sea Turtle (Hawksbill)', location: 'Tubbataha Reef', date: '2026-06-05', status: 'Resolved', desc: 'Found entangled in fishing net, rehabilitated and released.' },
    { id: 4, species: 'Palawan Peacock-Pheasant', location: 'Irawan Forest', date: '2026-06-03', status: 'Active', desc: 'Male with iridescent blue-black plumage, last seen near the trail head.' },
    { id: 5, species: 'Dugong', location: 'Port Barton', date: '2026-05-28', status: 'Active', desc: 'Regularly sighted in seagrass beds near the marine sanctuary.' },
    { id: 6, species: 'Monitor Lizard', location: 'Sabang', date: '2026-05-25', status: 'Resolved', desc: 'Relocated from residential area to the mangrove reserve.' },
  ],
  found: [
    { id: 7, species: 'Philippine Cockatoo', location: 'Narra', date: '2026-06-12', status: 'In Care', desc: 'Injured wing, brought in by local resident. Currently under treatment.' },
    { id: 8, species: 'Palm Civet', location: 'Puerto Princesa', date: '2026-06-09', status: 'Released', desc: 'Dehydrated but healthy, released after 48 hours of observation.' },
    { id: 9, species: 'Green Sea Turtle', location: 'El Nido', date: '2026-06-07', status: 'In Care', desc: 'Found stranded on beach, minor injuries to front flipper.' },
    { id: 10, species: 'Tabon Scrubfowl', location: 'Roxas', date: '2026-06-04', status: 'Released', desc: 'Disoriented juvenile, released after successful feeding.' },
    { id: 11, species: 'Fishing Cat', location: 'Aborlan', date: '2026-06-01', status: 'In Care', desc: 'Caught in snare, undergoing treatment for leg wound.' },
    { id: 12, species: 'Reticulated Python', location: 'Brooke\'s Point', date: '2026-05-30', status: 'Released', desc: 'Removed from poultry farm, released into protected forest.' },
    { id: 13, species: 'Wild Boar Piglet', location: 'Quezon', date: '2026-05-27', status: 'In Care', desc: 'Orphaned piglet, being bottle-fed at the center.' },
    { id: 14, species: 'Hornbill', location: 'San Vicente', date: '2026-05-24', status: 'Released', desc: 'Flew into window, stunned but unharmed. Released after recovery.' },
  ],
}

const CENTER = { lat: 9.799447, lng: 118.693766 }
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
}

function Location() {
  const { userPos, locError, distance, routePath, routeInfo, routeLoading } = useLocationContext()
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
  })

  function isOpen() {
    const now = new Date()
    const hours = now.getHours()
    const mins = now.getMinutes()
    const totalMins = hours * 60 + mins
    return totalMins >= 480 && totalMins < 1020 // 8:00 AM – 5:00 PM
  }

  return (
    <section className="border-t border-gray-100 px-6 py-16 sm:px-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-light text-gray-900 sm:text-3xl">Location</h2>
        <p className="mt-2 text-sm text-gray-400">
          Visit us at our rescue center in Palawan.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-5">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900">Palawan Wildlife Rescue &amp; Conservation Center</h3>
            <div className="mt-5 space-y-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">Address</p>
                <p className="mt-0.5 text-gray-500">Irawan, Puerto Princesa City<br />Palawan 5300, Philippines</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Operating Hours</p>
                <p className="mt-0.5 text-gray-500">Monday – Sunday<br />8:00 AM – 5:00 PM</p>
                <span
                  className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    isOpen()
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isOpen() ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  {isOpen() ? 'Open now' : 'Closed'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-700">Contact</p>
                <p className="mt-0.5 text-gray-500">+63 (48) 434-1234<br />rescue@palawanwildlife.org</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">In-Kind Donations</p>
                <p className="mt-0.5 text-gray-500">We accept veterinary supplies, animal feed, cleaning materials, and office equipment. Drop off during operating hours or coordinate with our logistics team.</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">
                  <span className="inline-flex items-center gap-1.5">
                    Distance from you
                    {distance !== null && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700 uppercase tracking-wider">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-600" />
                        </span>
                        Live
                      </span>
                    )}
                  </span>
                </p>
                {routeInfo ? (
                  <div className="mt-1 space-y-1">
                    <p className="flex items-baseline gap-1.5 text-gray-700">
                      <svg className="h-4 w-4 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-lg font-semibold tabular-nums">
                        {(routeInfo.distance / 1000).toFixed(1)} km
                      </span>
                      <span className="text-sm text-gray-400">via road</span>
                    </p>
                    <p className="flex items-center gap-1.5 pl-5.5 text-sm text-gray-500">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      ~{Math.round(routeInfo.duration / 60)} min drive
                    </p>
                  </div>
                ) : distance !== null ? (
                  <p className="mt-1 flex items-baseline gap-1.5 text-gray-700">
                    <svg className="h-4 w-4 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-lg font-semibold tabular-nums">
                      {distance < 1
                        ? `${(distance * 1000).toFixed(0)} m`
                        : `${distance.toFixed(1)} km`}
                    </span>
                    <span className="text-sm text-gray-400">straight-line</span>
                  </p>
                ) : (
                  <p className="mt-0.5 flex items-center gap-1.5 text-gray-500">
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {locError || 'Detecting your location...'}
                  </p>
                )}
              </div>


            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 lg:col-span-3">
            {loadError ? (
              <div className="flex min-h-[300px] items-center justify-center bg-gray-50 lg:min-h-[420px]">
                <p className="text-sm text-gray-400">Failed to load Google Maps. Check your API key.</p>
              </div>
            ) : !isLoaded ? (
              <div className="flex min-h-[300px] items-center justify-center bg-gray-50 lg:min-h-[420px]">
                <p className="text-sm text-gray-400">Loading map...</p>
              </div>
            ) : (
              <div className="relative">
                {routeLoading && (
                  <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center pt-3">
                    <span className="rounded-full bg-white/80 px-3 py-1 text-xs text-gray-500 shadow-sm backdrop-blur-sm">
                      Calculating route...
                    </span>
                  </div>
                )}
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '420px', minHeight: '300px' }}
                  center={userPos || CENTER}
                  zoom={userPos ? 13 : 11}
                  options={mapOptions}
                >
                  <Marker position={CENTER} title="Palawan Wildlife Rescue Center" />
                  {routePath && (
                    <Polyline
                      path={routePath}
                      options={{
                        strokeColor: '#16a34a',
                        strokeWeight: 4,
                        strokeOpacity: 0.85,
                        geodesic: true,
                      }}
                    />
                  )}
                  {userPos && (
                    <>
                      <Marker
                        position={userPos}
                        title="Your location"
                        icon={{
                          path: window.google.maps.SymbolPath.CIRCLE,
                          scale: 8,
                          fillColor: '#3b82f6',
                          fillOpacity: 1,
                          strokeColor: '#fff',
                          strokeWeight: 3,
                        }}
                      />
                      <Circle center={userPos} radius={30} options={{ fillColor: '#3b82f6', fillOpacity: 0.1, strokeColor: '#3b82f6', strokeOpacity: 0.3, strokeWeight: 1 }} />
                    </>
                  )}
                </GoogleMap>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function CommunityBoard() {
  const [modalTab, setModalTab] = useState(null)

  return (
    <section className="border-t border-gray-100 px-6 py-16 sm:px-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div>
          <h2 className="text-2xl font-light text-gray-900 sm:text-3xl">Community Board</h2>
          <p className="mt-2 text-sm text-gray-400">
            Recent wildlife reports from across Palawan.
          </p>
        </div>

        {categories.map((cat) => {
          const reports = mockReports[cat.id]
          const visible = reports.slice(0, 5)

          return (
            <div key={cat.id} className="mt-10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">{cat.title} Reports</h3>
                {reports.length > 5 && (
                  <button
                    onClick={() => setModalTab(cat.id)}
                    className="text-sm font-medium text-green-700 underline underline-offset-2 transition-colors hover:text-green-800"
                  >
                    View All
                  </button>
                )}
              </div>
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
                {visible.map((r) => (
                  <div key={r.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 h-36 w-full rounded-lg bg-gradient-to-br from-green-100 to-emerald-50" />
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-base font-semibold text-gray-900">{r.species}</h4>
                      <Badge variant={r.status === 'Active' || r.status === 'In Care' ? 'warning' : 'success'} size="sm">
                        {r.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-400">{r.location} &middot; {r.date}</p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500 line-clamp-2">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <Modal isOpen={!!modalTab} onClose={() => setModalTab(null)} title={`All ${modalTab === 'missing' ? 'Missing' : 'Found'} Animal Reports`} size="7xl">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modalTab && mockReports[modalTab]?.map((r) => (
            <div key={r.id} className="rounded-xl border border-gray-200 p-5">
              <div className="mb-3 h-40 w-full rounded-lg bg-gradient-to-br from-green-100 to-emerald-50" />
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-base font-semibold text-gray-900">{r.species}</h4>
                <Badge variant={r.status === 'Active' || r.status === 'In Care' ? 'warning' : 'success'} size="sm">
                  {r.status}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-gray-400">{r.location} &middot; {r.date}</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{r.desc}</p>
            </div>
          ))}
        </div>
      </Modal>
    </section>
  )
}

const newsItems = [
  { date: 'Jun 8, 2026', title: 'Rescue Center Reaches 12K Milestone', category: 'Milestone', desc: 'The center has successfully rescued and rehabilitated over 12,000 animals since opening its doors in 2015.' },
  { date: 'May 22, 2026', title: 'New Mangrove Nursery Established', category: 'Conservation', desc: 'A partnership with local communities has planted 3,000 mangrove seedlings along Puerto Princesa coastline.' },
  { date: 'Apr 14, 2026', title: 'Hawkbill Turtle Release at Tubbataha', category: 'Release', desc: 'After six months of rehabilitation, a juvenile hawksbill turtle was released back into the protected reef.' },
]

const events = [
  { date: 'Jul 15, 2026', title: 'Wildlife First-Responder Training', location: 'Rescue Center Auditorium', desc: 'A hands-on workshop covering basic wildlife handling, emergency triage, and safe transport techniques.' },
  { date: 'Aug 5, 2026', title: 'Coastal Clean-Up Drive', location: 'Sabang Beach', desc: 'Join volunteers for a morning of coastal cleanup followed by a short seminar on marine debris impact.' },
  { date: 'Sep 12, 2026', title: 'Community Appreciation Day', location: 'Rescue Center Grounds', desc: 'Open house with guided tours, wildlife exhibits, kids activities, and a chance to meet the rescue team.' },
]

function NewsEvents() {
  return (
    <section className="border-t border-gray-100 px-6 py-16 sm:px-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-light text-gray-900 sm:text-3xl">News &amp; Events</h2>
        <p className="mt-2 text-sm text-gray-400">
          Stay updated on rescues, releases, and upcoming community activities.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-gray-500 uppercase">Latest News</h3>
            <div className="mt-4 space-y-4">
              {newsItems.map((item) => (
                <div key={item.title} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="whitespace-nowrap rounded bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 uppercase tracking-wide">{item.category}</span>
                    <span className="text-xs text-gray-400">{item.date}</span>
                  </div>
                  <h4 className="mt-2 text-sm font-medium text-gray-900">{item.title}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wide text-gray-500 uppercase">Upcoming Events</h3>
            <div className="mt-4 space-y-4">
              {events.map((ev) => (
                <div key={ev.title} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5">
                      <span className="text-xs font-bold text-green-700 uppercase">{ev.date.split(' ')[0]}</span>
                      <span className="text-[10px] text-gray-500">{ev.date.split(',')[0].replace(ev.date.split(' ')[0], '').trim()}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{ev.title}</h4>
                      <p className="text-xs text-gray-400">{ev.location}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-gray-500">{ev.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Contact() {
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

function Carousel() {
  const [current, setCurrent] = useState(0)

  const prev = useCallback(() => setCurrent((c) => (c === 0 ? slides.length - 1 : c - 1)), [])
  const next = useCallback(() => setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1)), [])

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  const slide = slides[current]

  return (
    <section className="relative overflow-hidden px-6 py-16 sm:px-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="relative isolate overflow-hidden rounded-2xl">
          <div className={`absolute inset-0 bg-gradient-to-br ${slide.bg} transition-all duration-700`} />
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 flex flex-col items-center px-6 py-20 text-center text-white sm:px-12 lg:px-20">
            <h3 className="text-2xl font-bold sm:text-3xl">{slide.title}</h3>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
              {slide.desc}
            </p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={prev}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Previous slide"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all ${
                  i === current ? 'w-6 bg-green-700' : 'w-2 bg-gray-300'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Next slide"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}

export default function Landing() {
  return (
    <>
      <section className="relative flex min-h-screen items-center overflow-hidden px-6 py-12 sm:px-8 lg:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-green-100/40 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-emerald-100/30 blur-3xl" />
          <div className="absolute left-1/2 top-1/4 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-50/50 blur-2xl" />
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="text-center lg:text-left">
            <span className="inline-block max-w-full rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-medium tracking-wide text-emerald-700 uppercase sm:px-4 sm:py-1.5 sm:text-xs">
              Palawan Wildlife Rescue &amp; Conservation Center
            </span>
            <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:mt-6 sm:text-5xl lg:text-6xl">
              Helping Animals,{' '}
              <span className="text-green-700">Protecting Nature</span>
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-gray-500 sm:mt-6 sm:text-base sm:leading-relaxed lg:text-lg">
              Submit reports for wildlife sightings, stray animals, rescue emergencies, and animal welfare concerns across Palawan communities.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:justify-center lg:justify-start">
              <Button size="lg" className="w-full sm:w-auto">Report an Animal</Button>
              <Link to="/wildlife-guide"><Button variant="outline" size="lg" className="w-full sm:w-auto">Wildlife Guide</Button></Link>
            </div>
          </div>
          <div className="relative hidden h-72 lg:block lg:h-[28rem]">
            <div className="absolute right-0 h-full w-full overflow-hidden rounded-3xl bg-gradient-to-br from-green-50 via-emerald-50 to-amber-50">
              <div className="absolute bottom-0 left-0 right-0 h-1/2 rounded-t-[100%] bg-gradient-to-t from-green-700/20 to-transparent" />
              <div className="absolute bottom-12 left-0 right-0 mx-auto h-8 w-3/4 rounded-t-full bg-gradient-to-t from-green-800/30 to-transparent" />
              <div className="absolute bottom-8 left-8 h-20 w-20 rounded-full bg-yellow-200/60 blur-sm" />
              <div className="absolute bottom-4 left-1/3 h-6 w-6 rounded-full bg-green-600/20" />
              <div className="absolute bottom-6 right-1/4 h-4 w-4 rounded-full bg-green-600/20" />
              <div className="absolute bottom-8 left-1/2 h-3 w-3 rounded-full bg-green-600/15" />
              <div className="absolute right-12 top-12 h-24 w-24 rounded-full bg-white/60 shadow-lg" />
              <div className="absolute right-16 top-16 h-8 w-8 rounded-full bg-yellow-100" />
              <svg className="absolute left-8 top-8 h-12 w-12 text-green-600/20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <Carousel />

      <CommunityBoard />

      <Location />

      <NewsEvents />

      <section className="border-t border-gray-100 px-6 py-16 sm:px-8 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 grid grid-cols-2 gap-y-10 sm:grid-cols-4">
            {[
              { label: 'Rescues', value: '12K+' },
              { label: 'Teams', value: '500+' },
              { label: 'Countries', value: '30+' },
              { label: 'Response Time', value: '<5m' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-light text-gray-900">{stat.value}</p>
                <p className="mt-2 text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-light text-gray-900 sm:text-3xl">
            Everything you need to respond faster
          </h2>
          <p className="mt-2 max-w-xl text-sm text-gray-400">
            From first alert to final recovery, ResQBridge gives your team the tools to act decisively.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-8">
              <h3 className="text-base font-medium text-gray-900">Real-time Alerts</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">Instant notifications when disasters strike, so rescue teams can mobilize without delay.</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-8">
              <h3 className="text-base font-medium text-gray-900">Team Coordination</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">Centralized command hub for assigning roles, tracking progress, and sharing intel.</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-8">
              <h3 className="text-base font-medium text-gray-900">Resource Mapping</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">Live map of available shelters, hospitals, supplies, and transportation routes.</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-8">
              <h3 className="text-base font-medium text-gray-900">Victim Tracking</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">End-to-end visibility from rescue to recovery, ensuring no one is left behind.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-100 px-6 py-16 sm:px-8 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-light text-gray-900 sm:text-3xl">FAQ</h2>
          <p className="mt-2 text-sm text-gray-400">
            Common questions about wildlife rescue and our platform.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { q: 'How do I report a wildlife emergency?', a: 'Call our 24/7 hotline at +63 (48) 123-4567 or use the Report an Animal button on our homepage. Provide the location, species if known, and a description of the animal\'s condition.' },
              { q: 'What should I do if I find an injured animal?', a: 'Keep your distance, observe from a safe spot, and call our rescue hotline immediately. Do not attempt to feed, touch, or move the animal unless instructed by our team.' },
              { q: 'Can I volunteer at the rescue center?', a: 'Yes. We welcome volunteers for animal care, clean-up drives, and community education programs. Fill out the Contact form and select Volunteer as the subject.' },
              { q: 'How are donated funds used?', a: 'Donations go directly toward veterinary supplies, animal feed, facility maintenance, and community conservation programs. We publish annual transparency reports.' },
              { q: 'Do you accept drop-off donations?', a: 'Yes. In-kind donations like animal feed, cleaning materials, and office supplies can be dropped off during operating hours (Mon–Sun, 8 AM – 5 PM) at our Irawan center.' },
            ].map((faq) => (
              <details key={faq.q} className="group rounded-xl border border-gray-200 bg-white shadow-sm">
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium text-gray-900 transition hover:text-green-700">
                  {faq.q}
                  <svg className="h-4 w-4 shrink-0 text-gray-400 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="border-t border-gray-100 px-5 pb-4 pt-3 text-sm leading-relaxed text-gray-500">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Contact />
    </>
  )
}
