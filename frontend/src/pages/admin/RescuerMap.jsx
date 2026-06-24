import { useState, useEffect, useCallback } from 'react'
import { GoogleMap, Marker, InfoWindow, useLoadScript } from '@react-google-maps/api'
import { admin as adminApi } from '../../services/api'

const containerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '0.75rem',
}

const PAGE_SIZE = 8

export default function RescuerMap() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [page, setPage] = useState(1)

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

  const onLoad = useCallback(() => {}, [])

  const totalPages = Math.max(1, Math.ceil(locations.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = locations.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const center = locations.length > 0
    ? { lat: locations[0].latitude, lng: locations[0].longitude }
    : { lat: 14.5, lng: 121 }

  const activeRescuers = locations.filter((l) => {
    const age = Date.now() - new Date(l.updatedAt).getTime()
    return age < 60000
  }).length

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center rounded-xl bg-gray-100" style={{ height: '600px' }}>
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-green-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Rescuer Locations</h2>
          <p className="text-sm text-gray-500">
            {loading ? 'Loading...' : `${locations.length} rescuer${locations.length !== 1 ? 's' : ''} tracked`}
            {activeRescuers > 0 && ` · ${activeRescuers} active now`}
          </p>
        </div>
        <button
          onClick={() => { fetchLocations(); setPage(1) }}
          className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition-colors shadow"
        >
          Refresh
        </button>
      </div>

      <div className="rounded-xl overflow-hidden border-2 border-gray-200 mb-6">
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
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#16a34a',
                fillOpacity: 0.9,
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
              <div className="p-2 min-w-[140px]">
                <p className="font-bold text-gray-900 text-base">{selected.userName}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Last update: {new Date(selected.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      {locations.length > 0 && (
        <>
          <div className="rounded-2xl border-2 border-gray-200 bg-white overflow-hidden">
            <div className="divide-y-2 divide-gray-100">
              {paginated.map((loc) => (
                <div
                  key={loc.userId}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelected(loc)}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                    {loc.userName?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'R'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold text-gray-900">{loc.userName}</p>
                    <p className="text-sm text-gray-500">
                      {loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm text-gray-500">
                      {new Date(loc.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <span className={`inline-block mt-0.5 h-2 w-2 rounded-full ${
                      Date.now() - new Date(loc.updatedAt).getTime() < 60000 ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="rounded-xl border-2 border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:border-green-500 hover:text-green-700 transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`rounded-xl border-2 px-4 py-2 text-sm font-bold transition-colors ${
                    p === safePage
                      ? 'bg-green-600 text-white shadow border-green-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:text-green-700'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="rounded-xl border-2 border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:border-green-500 hover:text-green-700 transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
