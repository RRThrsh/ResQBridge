import { useEffect, useState, useCallback, useRef } from 'react'
import { GoogleMap, Marker, useLoadScript, Circle, Polyline } from '@react-google-maps/api'
import { useLocationContext } from '../../context/LocationContext.jsx'

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
}

export default function Location({ title, subtitle, center }) {
  const { userPos, locError, distance, routePath, routeInfo, routeLoading, requestLocation } = useLocationContext()

  useEffect(() => { requestLocation() }, [requestLocation])
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  const [mapLoaded, setMapLoaded] = useState(false)
  const polyRef = useRef(null)
  const routePathRef = useRef(routePath)
  routePathRef.current = routePath

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
  })

  const onMapLoad = useCallback(() => setMapLoaded(true), [])

  const onPolyLoad = useCallback((poly) => {
    polyRef.current = poly
    if (routePathRef.current && poly.setPath) poly.setPath(routePathRef.current)
  }, [])

  useEffect(() => {
    if (polyRef.current && routePath && polyRef.current.setPath) {
      polyRef.current.setPath(routePath)
    }
  }, [routePath])

  function isOpen() {
    const now = new Date()
    const hours = now.getHours()
    const mins = now.getMinutes()
    const totalMins = hours * 60 + mins
    return totalMins >= 480 && totalMins < 1020
  }

  return (
    <section className="border-t border-gray-100 px-6 py-16 sm:px-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-light text-gray-900 sm:text-3xl">{title}</h2>
        <p className="mt-2 text-sm text-gray-400">
          {subtitle}
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
                  center={userPos || center}
                  zoom={userPos ? 13 : 11}
                  options={mapOptions}
                  onLoad={onMapLoad}
                >
                  {mapLoaded && (
                    <>
                      <Marker position={center} title="Palawan Wildlife Rescue Center" />
                      {routePath && (
                        <Polyline
                          onLoad={onPolyLoad}
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
