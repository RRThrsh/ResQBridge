import { useState, useCallback, useEffect, useRef } from 'react'
import { GoogleMap, Marker, useLoadScript, Polyline } from '@react-google-maps/api'

const containerStyle = {
  width: '100%',
  height: '320px',
}

export default function ReportMap({ latitude, longitude, label, userPos, autoRoute, requestLocation }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const [routePath, setRoutePath] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [loadingRoute, setLoadingRoute] = useState(false)
  const [map, setMap] = useState(null)
  const [routeError, setRouteError] = useState(null)
  const followRef = useRef(true)
  const autoFetched = useRef(false)

  const { isLoaded } = useLoadScript({ googleMapsApiKey: apiKey })

  const onLoad = useCallback((m) => {
    setMap(m)
    if (latitude && longitude) {
      m.panTo({ lat: latitude, lng: longitude })
      m.setZoom(15)
    }
  }, [latitude, longitude])

  useEffect(() => {
    if (!map || !userPos || !followRef.current) return
    map.panTo(userPos)
  }, [map, userPos])

  useEffect(() => {
    if (autoRoute && userPos && !autoFetched.current) {
      autoFetched.current = true
      followRef.current = false
      fetchRoute(userPos.lat, userPos.lng)
    }
  }, [autoRoute, userPos])

  async function fetchRoute(originLat, originLng) {
    setLoadingRoute(true)
    setRouteError(null)
    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${longitude},${latitude}?overview=full&geometries=geojson&steps=false`
      )
      if (!res.ok) {
        setRouteError('Routing service unavailable.')
        return
      }
      const data = await res.json()
      if (data.code === 'Ok' && data.routes?.length) {
        const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => ({ lat, lng }))
        setRoutePath(coords)
        setRouteInfo({
          distance: data.routes[0].distance,
          duration: data.routes[0].duration,
        })
        if (map && window.google?.maps) {
          const bounds = new window.google.maps.LatLngBounds()
          coords.forEach((c) => bounds.extend(c))
          bounds.extend({ lat: originLat, lng: originLng })
          bounds.extend({ lat: latitude, lng: longitude })
          map.fitBounds(bounds, { top: 80, bottom: 160, left: 40, right: 40 })
        }
      } else {
        setRouteError('Could not calculate route to this location.')
      }
    } catch {
      setRouteError('Network error. Please try again.')
    } finally {
      setLoadingRoute(false)
    }
  }

  function handleDirections() {
    setRouteError(null)
    if (userPos) {
      fetchRoute(userPos.lat, userPos.lng)
      return
    }
    if (requestLocation) requestLocation()
    if (!navigator.geolocation) {
      setRouteError('Geolocation not supported by your browser.')
      return
    }
    setRouteError('Fetching your location...')
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchRoute(pos.coords.latitude, pos.coords.longitude),
      () => {
        setRouteError('Could not get your location. Please enable location access.')
        setTimeout(() => setRouteError(null), 5000)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  function clearRoute() {
    setRoutePath(null)
    setRouteInfo(null)
    setRouteError(null)
  }

  function handleNavigate() {
    setRouteError(null)
    if (userPos) {
      fetchRoute(userPos.lat, userPos.lng)
      return
    }
    if (requestLocation) requestLocation()
    if (!navigator.geolocation) {
      setRouteError('Geolocation not supported by your browser.')
      return
    }
    setRouteError('Fetching your location...')
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchRoute(pos.coords.latitude, pos.coords.longitude),
      () => {
        setRouteError('Could not get your location. Please enable location access.')
        setTimeout(() => setRouteError(null), 5000)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center rounded-xl bg-gray-100 border-2 border-gray-200" style={{ height: '320px' }}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="rounded-xl overflow-hidden border-2 border-gray-200 relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{ lat: latitude, lng: longitude }}
        zoom={15}
        onLoad={onLoad}
      >
        <Marker
          position={{ lat: latitude, lng: longitude }}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#ef4444',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 3,
          }}
          title={label || 'Report Location'}
        />

        {userPos && (
          <Marker
            position={userPos}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 9,
              fillColor: '#2563eb',
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 4,
            }}
            title="Your Location"
          />
        )}

        {routePath && (
          <>
            <Polyline
              path={routePath}
              options={{
                strokeColor: '#d97706',
                strokeWeight: 7,
                strokeOpacity: 0.2,
              }}
            />
            <Polyline
              path={routePath}
              options={{
                strokeColor: '#d97706',
                strokeWeight: 4,
                strokeOpacity: 0.9,
              }}
            />
          </>
        )}
      </GoogleMap>

      {routeError && (
        <div className="absolute top-3 left-3 right-3 z-10 rounded-xl bg-red-50 border-2 border-red-200 px-4 py-2.5 text-sm font-medium text-red-700 shadow">
          {routeError}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-gray-200 bg-white px-5 py-3">
        <div className="flex items-center gap-3">
          {routeInfo ? (
            <>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-base font-bold text-gray-900">{Math.round(routeInfo.duration / 60)} min</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span className="text-sm font-medium text-gray-600">{(routeInfo.distance / 1000).toFixed(1)} km</span>
              </div>
            </>
          ) : (
            <span className="text-base text-gray-500 font-medium">{label || 'Report location'}</span>
          )}
        </div>

        <div className="flex gap-2">
          {userPos && (
            <button
              onClick={() => { followRef.current = !followRef.current; if (followRef.current && map) map.panTo(userPos) }}
              className={`px-3 py-2 rounded-xl text-sm font-bold transition-colors border-2 ${
                followRef.current
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              Follow Me
            </button>
          )}
          {!routePath ? (
            <button
              onClick={() => { followRef.current = false; handleDirections() }}
              disabled={loadingRoute}
              className="bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-amber-700 disabled:opacity-50 transition-colors shadow flex items-center gap-1.5"
            >
              {loadingRoute ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Loading
                </span>
              ) : (
                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg> Get Directions</>
              )}
            </button>
          ) : (
            <button
              onClick={clearRoute}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors border-2 border-gray-200"
            >
              Clear Route
            </button>
          )}
          {!routePath && userPos && (
            <button
              onClick={() => { followRef.current = false; handleNavigate() }}
              disabled={loadingRoute}
              className="bg-amber-100 text-amber-800 px-4 py-2 rounded-xl text-sm font-bold hover:bg-amber-200 transition-colors border-2 border-amber-300 flex items-center gap-1.5"
            >
              {loadingRoute ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-800 border-t-transparent" />
              ) : (
                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg> Navigate</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
