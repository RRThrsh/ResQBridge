import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useLocationContext } from '../../context/LocationContext'
import AnimateIn from '../../components/ui/AnimateIn'

import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl })

function MapController({ center, userPos }) {
  const map = useMap()

  useEffect(() => {
    if (userPos) {
      map.setView([userPos.lat, userPos.lng], 13, { animate: true })
    } else if (center) {
      map.setView([center.lat, center.lng], 11, { animate: true })
    }
  }, [map, center, userPos])

  return null
}

export default function Location({ title, subtitle, center }) {
  const { userPos, locError, distance, routePath, routeInfo, routeLoading, requestLocation } = useLocationContext()

  useEffect(() => { requestLocation() }, [requestLocation])

  const leafletRoutePath = routePath?.map(p => [p.lat, p.lng])

  function isOpen() {
    const now = new Date()
    const totalMins = now.getHours() * 60 + now.getMinutes()
    return totalMins >= 480 && totalMins < 1020
  }

  const mapCenter = userPos || center

  return (
    <section className="border-t border-gray-100 px-6 py-20 sm:px-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <AnimateIn>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{title}</h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-500">{subtitle}</p>
        </AnimateIn>

        <div className="mt-10 grid gap-8 lg:grid-cols-5">
          <AnimateIn animation="fade-left" delay={100} className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900">Palawan Wildlife Rescue &amp; Conservation Center</h3>

              <div className="mt-6 space-y-5 text-sm">
                <InfoItem label="Address">
                  <p className="text-gray-500">Irawan, Puerto Princesa City<br />Palawan 5300, Philippines</p>
                </InfoItem>

                <InfoItem label="Operating Hours">
                  <p className="text-gray-500">Monday – Sunday<br />8:00 AM – 5:00 PM</p>
                  <span
                    className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      isOpen()
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${isOpen() ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {isOpen() ? 'Open now' : 'Closed'}
                  </span>
                </InfoItem>

                <InfoItem label="Contact">
                  <p className="text-gray-500">+63 (48) 434-1234<br />rescue@palawanwildlife.org</p>
                </InfoItem>

                <InfoItem label="In-Kind Donations">
                  <p className="text-gray-500">We accept veterinary supplies, animal feed, cleaning materials, and office equipment. Drop off during operating hours or coordinate with our logistics team.</p>
                </InfoItem>

                <div>
                  <p className="font-semibold text-gray-700">
                    <span className="inline-flex items-center gap-1.5">
                      Distance from you
                      {distance !== null && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-600" />
                          </span>
                          Live
                        </span>
                      )}
                    </span>
                  </p>
                  {routeInfo ? (
                    <div className="mt-1.5 space-y-1">
                      <p className="flex items-baseline gap-1.5 text-gray-700">
                        <svg className="h-4 w-4 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-lg font-semibold tabular-nums">
                          {(routeInfo.distance / 1000).toFixed(1)} km
                        </span>
                        <span className="text-sm text-gray-400">via road</span>
                      </p>
                      <p className="flex items-center gap-1.5 pl-5.5 text-sm text-gray-500">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        ~{Math.round(routeInfo.duration / 60)} min drive
                      </p>
                    </div>
                  ) : distance !== null ? (
                    <p className="mt-1.5 flex items-baseline gap-1.5 text-gray-700">
                      <svg className="h-4 w-4 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-lg font-semibold tabular-nums">
                        {distance < 1
                          ? `${(distance * 1000).toFixed(0)} m`
                          : `${distance.toFixed(1)} km`}
                      </span>
                      <span className="text-sm text-gray-400">straight-line</span>
                    </p>
                  ) : (
                    <div className="mt-1.5">
                      {locError ? (
                        <p className="flex items-center gap-1.5 text-sm text-gray-500">
                          <svg className="h-4 w-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          {locError}
                        </p>
                      ) : null}
                      <button
                        onClick={requestLocation}
                        className="mt-2 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition-all duration-200 hover:bg-emerald-100 hover:shadow-sm active:scale-[0.98]"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Get My Location
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </AnimateIn>

          <div className="relative overflow-hidden rounded-2xl border border-gray-200 lg:col-span-3">
            {routeLoading && (
              <div className="pointer-events-none absolute inset-0 z-[1000] flex items-start justify-center pt-3">
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs text-gray-500 shadow-sm backdrop-blur-sm">
                  Calculating route...
                </span>
              </div>
            )}
            <MapContainer
              center={[mapCenter.lat, mapCenter.lng]}
              zoom={userPos ? 13 : 11}
              className="z-0 h-[420px] w-full min-h-[300px]"
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapController center={center} userPos={userPos} />

              <Marker position={[center.lat, center.lng]} />

              {leafletRoutePath && (
                <Polyline
                  positions={leafletRoutePath}
                  pathOptions={{ color: '#16a34a', weight: 4, opacity: 0.85 }}
                />
              )}

              {userPos && (
                <>
                  <Circle
                    center={[userPos.lat, userPos.lng]}
                    radius={30}
                    pathOptions={{ fillColor: '#3b82f6', fillOpacity: 0.1, color: '#3b82f6', opacity: 0.3, weight: 1 }}
                  />
                  <Circle
                    center={[userPos.lat, userPos.lng]}
                    radius={4}
                    pathOptions={{ fillColor: '#3b82f6', fillOpacity: 1, color: '#fff', weight: 3 }}
                  />
                </>
              )}
            </MapContainer>
          </div>
        </div>
      </div>
    </section>
  )
}

function InfoItem({ label, children }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      <div className="mt-0.5">{children}</div>
    </div>
  )
}
