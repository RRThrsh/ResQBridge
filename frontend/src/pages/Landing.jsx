import { useState, useEffect, useCallback, useRef } from 'react'
import { Button, Modal, Badge } from '../components/ui'
import { GoogleMap, Marker, useLoadScript, Circle, Polyline } from '@react-google-maps/api'

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
  { label: 'Response Time', value: '&lt;5m' },
]

const features = [
  {
    title: 'Real-time Alerts',
    desc: 'Instant notifications when disasters strike, so rescue teams can mobilize without delay.',
  },
  {
    title: 'Team Coordination',
    desc: 'Centralized command hub for assigning roles, tracking progress, and sharing intel.',
  },
  {
    title: 'Resource Mapping',
    desc: 'Live map of available shelters, hospitals, supplies, and transportation routes.',
  },
  {
    title: 'Victim Tracking',
    desc: 'End-to-end visibility from rescue to recovery, ensuring no one is left behind.',
  },
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

function haversineDistance(coords1, coords2) {
  const R = 6371
  const dLat = ((coords2.lat - coords1.lat) * Math.PI) / 180
  const dLng = ((coords2.lng - coords1.lng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((coords1.lat * Math.PI) / 180) *
      Math.cos((coords2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function Location() {
  const [userPos, setUserPos] = useState(null)
  const [locError, setLocError] = useState(null)
  const [distance, setDistance] = useState(null)
  const [routePath, setRoutePath] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [routeLoading, setRouteLoading] = useState(false)
  const watchId = useRef(null)
  const routeFetched = useRef(false)
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocError('Geolocation not supported')
      return
    }
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserPos(coords)
        setDistance(haversineDistance(coords, CENTER))
        setLocError(null)
        if (!routeFetched.current) fetchRoute(coords)
      },
      (err) => {
        setLocError('Enable location services to calculate distance')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
    return () => {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current)
    }
  }, [])

  async function fetchRoute(origin) {
    setRouteLoading(true)
    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${CENTER.lng},${CENTER.lat}?overview=full&geometries=geojson&steps=false`,
      )
      const data = await res.json()
      if (data.code === 'Ok' && data.routes[0]) {
        const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => ({ lat, lng }))
        setRoutePath(coords)
        setRouteInfo({
          distance: data.routes[0].distance,
          duration: data.routes[0].duration,
        })
        routeFetched.current = true
      }
    } catch {
      // silently fail — map still works
    } finally {
      setRouteLoading(false)
    }
  }

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
              <Button variant="outline" size="lg" className="w-full sm:w-auto">Wildlife Guide</Button>
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

      <section className="border-t border-gray-100 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto mb-20 grid max-w-lg grid-cols-2 gap-y-10 sm:grid-cols-4 sm:gap-y-0">
            {[
              { label: 'Rescues', value: '12K+' },
              { label: 'Teams', value: '500+' },
              { label: 'Countries', value: '30+' },
              { label: 'Response Time', value: '&lt;5m' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-light text-gray-900">{stat.value}</p>
                <p className="mt-1 text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          <h2 className="text-center text-2xl font-light text-gray-900 sm:text-3xl">
            Everything you need to respond faster
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-sm text-gray-400">
            From first alert to final recovery, ResQBridge gives your team the tools to act decisively.
          </p>
          <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="bg-white p-8">
                <h3 className="text-base font-medium text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-gray-100 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-light text-gray-900 sm:text-3xl">
            Ready to bridge the gap?
          </h2>
          <p className="mt-4 text-sm text-gray-400">
            Join hundreds of rescue organizations already using ResQBridge.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button size="lg">Start Free Trial</Button>
            <Button variant="outline" size="lg">Talk to Sales</Button>
          </div>
        </div>
      </section>
    </>
  )
}
