import { useState, useEffect, useCallback } from 'react'
import { GoogleMap, Marker, InfoWindow, useLoadScript } from '@react-google-maps/api'
import { admin as adminApi } from '../../services/api'

const containerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '0.75rem',
}

export default function RescuerMap() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [map, setMap] = useState(null)

  const { isLoaded } = useLoadScript({ googleMapsApiKey: apiKey })

  const fetchLocations = useCallback(async () => {
    try {
      const data = await adminApi.getRescuerLocations()
      setLocations(data.locations || [])
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchLocations()
    const interval = setInterval(fetchLocations, 15000)
    return () => clearInterval(interval)
  }, [fetchLocations])

  const onLoad = useCallback((m) => {
    setMap(m)
  }, [])

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center rounded-xl bg-gray-100" style={{ height: '600px' }}>
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-amber-600 border-t-transparent" />
      </div>
    )
  }

  const center = locations.length > 0
    ? { lat: locations[0].latitude, lng: locations[0].longitude }
    : { lat: 14.5, lng: 121 }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Rescuer Locations</h2>
          <p className="text-sm text-gray-500">
            {loading ? 'Loading...' : `${locations.length} rescuer${locations.length !== 1 ? 's' : ''} online`}
          </p>
        </div>
        <button
          onClick={fetchLocations}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="rounded-xl overflow-hidden border-2 border-gray-200">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={11}
          onLoad={onLoad}
        >
          {locations.map((loc) => (
            <Marker
              key={loc.userId}
              position={{ lat: loc.latitude, lng: loc.longitude }}
              title={loc.userName}
              onClick={() => setSelected(loc)}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#d97706',
                fillOpacity: 1,
                strokeColor: '#fff',
                strokeWeight: 4,
              }}
            />
          ))}

          {selected && (
            <InfoWindow
              position={{ lat: selected.latitude, lng: selected.longitude }}
              onCloseClick={() => setSelected(null)}
            >
              <div className="p-2">
                <p className="font-bold text-gray-900 text-base">{selected.userName}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Updated {new Date(selected.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  )
}
