import { useState, useEffect, useRef, useCallback } from 'react'
import { GoogleMap, useLoadScript } from '@react-google-maps/api'
import { useAuth } from '../../context/AuthContext'
import { useLocationContext } from '../../context/LocationContext'
import { rescuer as rescuerApi } from '../../services/api'

const containerStyle = { width: '100%', height: '100%', borderRadius: '0.75rem' }

const DEFAULT_CENTER = { lat: 9.799447, lng: 118.693766 }

function icon(g, scale, fillColor) {
  return {
    path: g.maps.SymbolPath.CIRCLE,
    scale,
    fillColor,
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeWeight: 4,
  }
}

export default function TeamMap() {
  const { isLoaded } = useLoadScript({ googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY })
  const { user } = useAuth()
  const { userPos } = useLocationContext()
  const [rescuers, setRescuers] = useState([])
  const mapRef = useRef(null)
  const userMarkerRef = useRef(null)
  const rescuerMarkersRef = useRef({})
  const infoWindowRef = useRef(null)

  const onMapLoad = useCallback((map) => {
    mapRef.current = map
  }, [])

  useEffect(() => {
    const g = window.google
    if (!mapRef.current || !userPos || !g) return
    if (userMarkerRef.current) {
      userMarkerRef.current.setPosition(userPos)
    } else {
      userMarkerRef.current = new g.maps.Marker({
        position: userPos,
        map: mapRef.current,
        icon: icon(g, 10, '#2563eb'),
        title: 'Your Location',
      })
    }
  }, [userPos])

  useEffect(() => {
    const g = window.google
    if (!mapRef.current || !g) return

    const ids = new Set(rescuers.filter((r) => r.rescuerEmail !== user?.email).map((r) => r.userId))

    for (const id of Object.keys(rescuerMarkersRef.current)) {
      if (!ids.has(id)) {
        rescuerMarkersRef.current[id].setMap(null)
        delete rescuerMarkersRef.current[id]
      }
    }

    for (const r of rescuers) {
      if (r.rescuerEmail === user?.email) continue
      const pos = { lat: r.latitude, lng: r.longitude }
      const existing = rescuerMarkersRef.current[r.userId]
      if (existing) {
        existing.setPosition(pos)
      } else {
        const marker = new g.maps.Marker({
          position: pos,
          map: mapRef.current,
          icon: icon(g, 8, '#16a34a'),
        })
        marker.addListener('click', () => {
          mapRef.current.panTo(pos)
          if (infoWindowRef.current) infoWindowRef.current.close()
          infoWindowRef.current = new g.maps.InfoWindow({
            position: pos,
            content: `<div class="text-sm font-medium text-gray-900">${r.rescuerName || r.userName}</div>`,
          })
          infoWindowRef.current.addListener('closeclick', () => { infoWindowRef.current = null })
          infoWindowRef.current.open(mapRef.current)
        })
        rescuerMarkersRef.current[r.userId] = marker
      }
    }
  }, [rescuers, user?.email])

  useEffect(() => {
    return () => {
      for (const id of Object.keys(rescuerMarkersRef.current)) {
        rescuerMarkersRef.current[id].setMap(null)
      }
      rescuerMarkersRef.current = {}
    }
  }, [])

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
          <GoogleMap mapContainerStyle={containerStyle} defaultCenter={DEFAULT_CENTER} defaultZoom={12} onLoad={onMapLoad} />
        </div>
      </div>
    </main>
  )
}
