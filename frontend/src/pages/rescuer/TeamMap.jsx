import { useState, useEffect } from 'react'
import { GoogleMap, Marker, useLoadScript, InfoWindow } from '@react-google-maps/api'
import { useAuth } from '../../context/AuthContext'
import { useLocationContext } from '../../context/LocationContext'
import { rescuer as rescuerApi } from '../../services/api'

const containerStyle = { width: '100%', height: '100%', borderRadius: '0.75rem' }

const DEFAULT_CENTER = { lat: 9.799447, lng: 118.693766 }

export default function TeamMap() {
  const { isLoaded } = useLoadScript({ googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY })
  const { user } = useAuth()
  const { userPos } = useLocationContext()
  const [rescuers, setRescuers] = useState([])
  const [selected, setSelected] = useState(null)
  const [center, setCenter] = useState(null)

  useEffect(() => {
    if (!center && userPos) setCenter(userPos)
  }, [userPos])

  useEffect(() => {
    async function fetchLocations() {
      try {
        const data = await rescuerApi.getRescuerLocations()
        setRescuers(data.locations || [])
      } catch {}
    }
    fetchLocations()
    const id = setInterval(fetchLocations, 15000)
    return () => clearInterval(id)
  }, [])

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full rounded-xl bg-gray-100 border-2 border-gray-200" style={{ minHeight: '500px' }}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Team Map</h1>
          <p className="mt-1 text-lg text-gray-500">See other rescuers in your area ({rescuers.length} online)</p>
        </div>
        <div className="rounded-xl overflow-hidden border-2 border-gray-200" style={{ height: '70vh' }}>
          <GoogleMap mapContainerStyle={containerStyle} center={center || DEFAULT_CENTER} zoom={12}>
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
            {rescuers.filter((r) => r.rescuerEmail !== user?.email).map((r) => (
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
                <div className="text-sm font-medium text-gray-900">{selected.rescuerName || selected.userName}</div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      </div>
    </main>
  )
}
