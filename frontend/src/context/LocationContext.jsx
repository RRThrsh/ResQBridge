import { createContext, useContext, useState, useEffect, useRef } from 'react'

const LocationContext = createContext(null)

const CENTER = { lat: 9.799447, lng: 118.693766 }

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

export function LocationProvider({ children }) {
  const [userPos, setUserPos] = useState(null)
  const [locError, setLocError] = useState(null)
  const [distance, setDistance] = useState(null)
  const [routePath, setRoutePath] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [routeLoading, setRouteLoading] = useState(false)
  const watchIdRef = useRef(null)

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
      }
    } catch { /* silent */ }
    finally { setRouteLoading(false) }
  }

  function requestLocation() {
    if (watchIdRef.current) return

    if (!navigator.geolocation) {
      setLocError('Geolocation not supported')
      return
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserPos(coords)
        setDistance(haversineDistance(coords, CENTER))
        setLocError(null)
      },
      () => setLocError('Enable location services'),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  return (
    <LocationContext.Provider value={{ userPos, locError, distance, routePath, routeInfo, routeLoading, requestLocation }}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocationContext() {
  return useContext(LocationContext)
}
