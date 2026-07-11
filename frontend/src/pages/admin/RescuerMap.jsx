import { useState, useEffect, useCallback, useMemo } from 'react'
import { GoogleMap, Marker, InfoWindow, useLoadScript } from '@react-google-maps/api'
import { admin as adminApi } from '../../services/api'

const MAP_STYLE = { width: '100%', height: '100%', borderRadius: '0.75rem' }

const STATUS_LABEL = {
  pending: 'Pending',
  assigned: 'Assigned',
  en_route: 'En Route',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  failed: 'Failed',
}

const STATUS_COLOR = {
  pending: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',
  en_route: 'bg-orange-100 text-orange-800',
  in_progress: 'bg-purple-100 text-purple-800',
  resolved: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
}

function activeAgo(updatedAt) {
  const age = Date.now() - new Date(updatedAt).getTime()
  if (age < 60000) return { label: 'Active now', online: true }
  if (age < 300000) return { label: `${Math.floor(age / 60000)}m ago`, online: false }
  return { label: `${Math.floor(age / 3600000)}h ago`, online: false }
}

export default function RescuerMap() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRescuer, setSelectedRescuer] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [assignLoading, setAssignLoading] = useState(false)
  const [search, setSearch] = useState('')

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

  const fetchAssignments = useCallback(async (rescuer) => {
    if (!rescuer?.userId) return
    setAssignLoading(true)
    try {
      const data = await adminApi.getRescuerReports(rescuer.userId)
      setAssignments(data.reports || [])
    } catch {
      setAssignments([])
    } finally {
      setAssignLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedRescuer) {
      fetchAssignments(selectedRescuer)
    } else {
      setAssignments([])
    }
  }, [selectedRescuer, fetchAssignments])

  const handleSelect = useCallback((loc) => {
    setSelectedRescuer((prev) => (prev?.userId === loc.userId ? null : loc))
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return locations
    const q = search.toLowerCase()
    return locations.filter((l) => l.userName?.toLowerCase().includes(q))
  }, [locations, search])

  const enRouteCount = useMemo(
    () => locations.filter((l) => Date.now() - new Date(l.updatedAt).getTime() < 60000).length,
    [locations],
  )

  const center = selectedRescuer
    ? { lat: selectedRescuer.latitude, lng: selectedRescuer.longitude }
    : locations.length > 0
      ? { lat: locations[0].latitude, lng: locations[0].longitude }
      : { lat: 14.5, lng: 121 }

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
          <h2 className="text-xl font-bold text-gray-900">Rescuer Map</h2>
          <p className="text-sm text-gray-500">
            {loading ? 'Loading...' : `${locations.length} rescuer${locations.length !== 1 ? 's' : ''} tracked`}
            {enRouteCount > 0 && ` · ${enRouteCount} active now`}
          </p>
        </div>
        <button
          onClick={() => { fetchLocations(); setSelectedRescuer(null) }}
          className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition-colors shadow"
        >
          Refresh
        </button>
      </div>

      <div className="flex gap-4 h-[640px]">
        <div className="flex-1 rounded-xl overflow-hidden border-2 border-gray-200">
          <GoogleMap
            mapContainerStyle={MAP_STYLE}
            center={center}
            zoom={selectedRescuer ? 14 : 11}
            onLoad={() => {}}
          >
            {locations.map((loc) => (
              <Marker
                key={loc.userId}
                position={{ lat: loc.latitude, lng: loc.longitude }}
                title={loc.userName}
                onClick={() => handleSelect(loc)}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: selectedRescuer?.userId === loc.userId ? 14 : 10,
                  fillColor: selectedRescuer?.userId === loc.userId ? '#2563eb' : '#16a34a',
                  fillOpacity: 0.9,
                  strokeColor: '#fff',
                  strokeWeight: 4,
                }}
              />
            ))}

            {selectedRescuer && (
              <InfoWindow
                position={{ lat: selectedRescuer.latitude, lng: selectedRescuer.longitude }}
                onCloseClick={() => setSelectedRescuer(null)}
              >
                <div className="p-2 min-w-[160px]">
                  <p className="font-bold text-gray-900 text-base">{selectedRescuer.userName}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(selectedRescuer.updatedAt).toLocaleTimeString('en-US', {
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                  {selectedRescuer.animalName && (
                    <p className="text-sm text-gray-600 mt-1">
                      Tracking: {selectedRescuer.animalName}
                    </p>
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>

        <div className="w-96 rounded-xl border-2 border-gray-200 bg-white flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search rescuer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
            />
          </div>

          {selectedRescuer && (
            <div className="border-b border-gray-100 bg-green-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="font-bold text-gray-900">{selectedRescuer.userName}</p>
                <button
                  onClick={() => setSelectedRescuer(null)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  &times; Clear
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {(() => {
                  const { label, online } = activeAgo(selectedRescuer.updatedAt)
                  return (
                    <>
                      <span className={`h-2 w-2 rounded-full ${online ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="text-sm text-gray-600">{label}</span>
                    </>
                  )
                })()}
                {selectedRescuer.reportId && (
                  <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                    En Route
                  </span>
                )}
              </div>
            </div>
          )}

          {selectedRescuer && assignLoading && (
            <div className="flex items-center justify-center py-8 text-sm text-gray-400">
              <div className="h-5 w-5 mr-2 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
              Loading assignments...
            </div>
          )}

          {selectedRescuer && !assignLoading && assignments.length > 0 && (
            <div className="border-b border-gray-100 px-4 py-2 bg-gray-50">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Assignments ({assignments.length})
              </p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {!selectedRescuer ? (
              filtered.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-gray-400">
                  {search ? 'No rescuers found' : 'No rescuers available'}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filtered.map((loc) => {
                    const { label, online } = activeAgo(loc.updatedAt)
                    return (
                      <div
                        key={loc.userId}
                        onClick={() => handleSelect(loc)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                          {loc.userName?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'R'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-900 truncate">{loc.userName}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${online ? 'bg-green-500' : 'bg-gray-400'}`} />
                            <span className="text-xs text-gray-500">{label}</span>
                          </div>
                        </div>
                        {loc.isTracking && (
                          <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-full">
                            En Route
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            ) : !assignLoading && (
              <div className="divide-y divide-gray-100">
                {assignments.length === 0 ? (
                  <div className="flex items-center justify-center h-24 text-sm text-gray-400">
                    No assignments
                  </div>
                ) : (
                  assignments.map((rep) => (
                    <div key={rep._id} className="px-4 py-3 hover:bg-gray-50">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {rep.animalType || rep.name}
                          </p>
                          {rep.location && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate" title={rep.location}>
                              {rep.location}
                            </p>
                          )}
                          {rep.description && (
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{rep.description}</p>
                          )}
                        </div>
                        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[rep.status] || 'bg-gray-100 text-gray-700'}`}>
                          {STATUS_LABEL[rep.status] || rep.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-400">
                        {rep.urgency && (
                          <span className={`font-bold ${rep.urgency === 'high' || rep.urgency === 'critical' ? 'text-red-500' : 'text-gray-500'}`}>
                            {rep.urgency}
                          </span>
                        )}
                        <span>{new Date(rep.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
