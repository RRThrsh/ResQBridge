import { useState, useEffect, useCallback } from 'react'
import { GoogleMap, Marker, InfoWindow, useLoadScript } from '@react-google-maps/api'
import { useAuth } from '../../context/AuthContext'
import { useLocationContext } from '../../context/LocationContext'
import { rescuer as rescuerApi } from '../../services/api'

const origObserve = IntersectionObserver.prototype.observe
IntersectionObserver.prototype.observe = function (el) {
  if (!el) return
  return origObserve.call(this, el)
}

const containerStyle = { width: '100%', height: '100%' }

export default function TeamMap() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const { user } = useAuth()
  const { userPos } = useLocationContext()
  const [rescuers, setRescuers] = useState([])
  const [selected, setSelected] = useState(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const center = userPos || { lat: 9.799447, lng: 118.693766 }

  const { isLoaded, loadError } = useLoadScript({ googleMapsApiKey: apiKey })
  const mapsFailed = loadError || (isLoaded && !window.google?.maps?.version)

  const onMapLoad = useCallback(() => {
    if (window.google?.maps?.version) setMapLoaded(true)
  }, [])

  useEffect(() => {
    async function fetchLocations() {
      try { const d = await rescuerApi.getRescuerLocations(); setRescuers(d.locations || []) } catch {}
    }
    fetchLocations()
    const id = setInterval(fetchLocations, 15000)
    return () => clearInterval(id)
  }, [])

  const online = rescuers.filter((r) => r.userId !== user?.uuid).length

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Team Map</h1>
          <p className="mt-1 text-lg text-gray-500">
            {loadError || mapsFailed ? 'Google Maps is unavailable' : `See other rescuers in your area (${online} online)`}
          </p>
        </div>
        <div className={`rounded-xl overflow-hidden border-2 ${loadError || mapsFailed ? 'bg-red-50 border-red-200' : 'border-gray-200'}`} style={{ height: '70vh' }}>
          {loadError || mapsFailed ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-lg font-semibold text-red-700">Map service unavailable</p>
                <p className="mt-1 text-sm text-red-500">The Google Maps API key is invalid or has exceeded its quota.</p>
              </div>
            </div>
          ) : !isLoaded ? (
            <div className="flex items-center justify-center h-full">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
            </div>
          ) : (
            <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12} onLoad={onMapLoad}>
              {mapLoaded && (
                <>
                  {userPos && (
                    <Marker
                      position={userPos}
                      icon={{
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: '#2563eb',
                        fillOpacity: 1,
                        strokeColor: '#fff',
                        strokeWeight: 4,
                      }}
                      title="Your Location"
                    />
                  )}
                  {rescuers.filter((r) => r.userId !== user?.uuid).map((r) => (
                    <Marker
                      key={r.userId}
                      position={{ lat: r.latitude, lng: r.longitude }}
                      onClick={() => setSelected(r)}
                      icon={{
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: '#16a34a',
                        fillOpacity: 1,
                        strokeColor: '#fff',
                        strokeWeight: 3,
                      }}
                    />
                  ))}
                  {selected && (
                    <InfoWindow
                      position={{ lat: selected.latitude, lng: selected.longitude }}
                      onCloseClick={() => setSelected(null)}
                    >
                      <div className="text-sm font-medium text-gray-900">{selected.userName}</div>
                    </InfoWindow>
                  )}
                </>
              )}
            </GoogleMap>
          )}
        </div>
      </div>
    </main>
  )
}
