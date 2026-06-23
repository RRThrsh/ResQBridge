import { useState, useCallback } from 'react'
import { GoogleMap, Marker, useLoadScript, Polyline } from '@react-google-maps/api'

const containerStyle = {
  width: '100%',
  height: '320px',
  borderRadius: '0.75rem',
}

export default function ReportMap({ latitude, longitude, label, userPos }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const [routePath, setRoutePath] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [loadingRoute, setLoadingRoute] = useState(false)
  const [map, setMap] = useState(null)

  const { isLoaded } = useLoadScript({ googleMapsApiKey: apiKey })

  const onLoad = useCallback((m) => {
    setMap(m)
    if (latitude && longitude) {
      m.panTo({ lat: latitude, lng: longitude })
      m.setZoom(15)
    }
  }, [latitude, longitude])

  async function fetchRoute(originLat, originLng) {
    setLoadingRoute(true)
    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${longitude},${latitude}?overview=full&geometries=geojson&steps=false`
      )
      const data = await res.json()
      if (data.code === 'Ok' && data.routes?.length) {
        const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => ({ lat, lng }))
        setRoutePath(coords)
        setRouteInfo({
          distance: data.routes[0].distance,
          duration: data.routes[0].duration,
        })
      }
    } catch {
      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${latitude},${longitude}`,
        '_blank'
      )
    } finally {
      setLoadingRoute(false)
    }
  }

  function handleDirections() {
    if (!userPos) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
        '_blank'
      )
      return
    }
    fetchRoute(userPos.lat, userPos.lng)
  }

  function clearRoute() {
    setRoutePath(null)
    setRouteInfo(null)
  }

  function openInGoogleMaps() {
    if (userPos) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${userPos.lat},${userPos.lng}&destination=${latitude},${longitude}`,
        '_blank'
      )
    } else {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
        '_blank'
      )
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center rounded-xl bg-gray-100 border-2 border-gray-200" style={{ height: '320px' }}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="rounded-xl overflow-hidden border-2 border-gray-200">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{ lat: latitude, lng: longitude }}
        zoom={15}
        onLoad={onLoad}
      >
        <Marker
          position={{ lat: latitude, lng: longitude }}
          title={label || 'Report Location'}
        />

        {userPos && (
          <Marker
            position={userPos}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#2563eb',
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 4,
            }}
            title="Your Location"
          />
        )}

        {routePath && (
          <Polyline
            path={routePath}
            options={{
              strokeColor: '#d97706',
              strokeWeight: 5,
              strokeOpacity: 0.9,
            }}
          />
        )}
      </GoogleMap>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-gray-200 bg-white px-5 py-4">
        <div className="text-base text-gray-700 font-medium">
          {routeInfo
            ? `${(routeInfo.distance / 1000).toFixed(1)} km - ${Math.round(routeInfo.duration / 60)} min`
            : (label || 'Report location')}
        </div>
        <div className="flex gap-2">
          {!routePath ? (
            <button
              onClick={handleDirections}
              disabled={loadingRoute}
              className="bg-amber-600 text-white px-5 py-2.5 rounded-xl text-base font-bold hover:bg-amber-700 disabled:opacity-50 transition-colors shadow"
            >
              {loadingRoute ? 'Loading...' : 'Get Directions'}
            </button>
          ) : (
            <button
              onClick={clearRoute}
              className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl text-base font-bold hover:bg-gray-200 transition-colors border-2 border-gray-200"
            >
              Clear Route
            </button>
          )}
          <button
            onClick={openInGoogleMaps}
            className="bg-amber-100 text-amber-800 px-5 py-2.5 rounded-xl text-base font-bold hover:bg-amber-200 transition-colors border-2 border-amber-300"
          >
            Navigate
          </button>
        </div>
      </div>
    </div>
  )
}
