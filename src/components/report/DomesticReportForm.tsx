import { useCallback, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, AlertTriangle, Loader2, Info, Crosshair } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUserAuth } from '@/context/UserAuthContext'
import { toast } from 'sonner'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { normalizeEmail } from '@/lib/admin'
import { ReportContactField } from '@/components/report/ReportContactField'
import { ReportPhotoField } from '@/components/report/ReportPhotoField'
import {
  photoStorageIdsForSubmit,
  validateReportPhotosForSubmit,
  type ReportPhotoItem,
} from '@/lib/reportPhotos'
import { cn } from '@/lib/utils'

// --- IMPORTS FOR INTERACTIVE MAP ---
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const DEFAULT_MAP_LAT = 9.7393
const DEFAULT_MAP_LNG = 118.7361

// --- FIX 1: ACCURATE PIN PLACEMENT ---
// Added iconSize and iconAnchor so Leaflet knows exactly where the center of the dot is.
const customMarkerIcon = L.divIcon({
  className: 'custom-map-marker',
  html: `<div style="background-color: hsl(var(--primary)); width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9], // Points to the exact center of the 18x18 div
})

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'DWARRMS Domestic Report (contact@pwrcc.local)',
      },
    })
    if (!res.ok) return null
    const data = (await res.json()) as { display_name?: string }
    return data.display_name ?? null
  } catch {
    return null
  }
}

function getRefinedPosition(maxWaitMs = 10_000): Promise<{
  lat: number
  lng: number
  accuracyM: number
}> {
  return new Promise((resolve, reject) => {
    let best: { lat: number; lng: number; accuracyM: number } | null = null
    let settled = false

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        const acc = Number.isFinite(accuracy) && accuracy > 0 ? accuracy : 9999
        if (!best || acc < best.accuracyM) {
          best = { lat: latitude, lng: longitude, accuracyM: acc }
          if (acc <= 25) finish(best)
        }
      },
      (err) => {
        if (best) finish(best)
        else if (!settled) {
          settled = true
          cleanup()
          reject(err)
        }
      },
      { enableHighAccuracy: true, maximumAge: 0 },
    )

    const timer = window.setTimeout(() => {
      if (best) finish(best)
      else if (!settled) {
        settled = true
        cleanup()
        reject(new Error('Location timeout'))
      }
    }, maxWaitMs)

    function finish(result: { lat: number; lng: number; accuracyM: number }) {
      if (settled) return
      settled = true
      cleanup()
      resolve(result)
    }

    function cleanup() {
      window.clearTimeout(timer)
      navigator.geolocation.clearWatch(id)
    }
  })
}

function formatPinLine(lat: number, lng: number, placename: string | null): string {
  const pair = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  return placename ? `${placename} · ${pair}` : pair
}

// --- FIX 2: STOP THE MAP FROM JUMPING ON CLICK ---
function ClickableMap({ 
  coords, 
  onMapClick 
}: { 
  coords: {lat: number, lng: number, source?: 'gps' | 'click'} | null, 
  onMapClick: (lat: number, lng: number) => void 
}) {
  const map = useMap()

  // ONLY move the camera if the source is GPS. Do nothing to the camera on click.
  useEffect(() => {
    if (coords && coords.source === 'gps') {
      map.flyTo([coords.lat, coords.lng], 16, { animate: true })
    }
  }, [coords, map])

  useMapEvents({
    click(e: L.LeafletMouseEvent) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })

  return coords ? <Marker position={[coords.lat, coords.lng]} icon={customMarkerIcon} /> : null
}

export function DomesticReportForm() {
  const navigate = useNavigate()
  const { user } = useUserAuth()
  const createReportMutation = useMutation(api.reports.create)
  const profile = useQuery(
    api.users.getProfile,
    user ? { email: normalizeEmail(user.email) } : 'skip',
  )
  const [loading, setLoading] = useState(false)
  const [locFetching, setLocFetching] = useState(false)
  const [reportType, setReportType] = useState('missing')
  const [photos, setPhotos] = useState<ReportPhotoItem[]>([])
  
  // Track where the coordinates came from
  const [coords, setCoords] = useState<{ lat: number; lng: number; source?: 'gps' | 'click' } | null>(null)

  const [formData, setFormData] = useState({
    species: '',
    animalName: '',
    color: '',
    location: '',
    description: '',
    reporterPhone: '',
    quantity: '1',
    reportedSize: '',
    seenAt: '',
  })

  const userContactPhone = profile?.contactPhone;

  useEffect(() => {
    if (userContactPhone) {
      setFormData((prev) => {
        if (!prev.reporterPhone) {
          let cleaned = userContactPhone.replace(/\D/g, '')
          if (cleaned.length > 11) cleaned = cleaned.slice(0, 11)
          return { ...prev, reporterPhone: cleaned }
        }
        return prev
      })
    }
  }, [userContactPhone])

  // Default source is 'click'
  const updateLocationData = async (lat: number, lng: number, source: 'gps' | 'click' = 'click') => {
    setLocFetching(true)
    setCoords({ lat, lng, source })
    
    try {
      const label = await reverseGeocode(lat, lng)
      setFormData((prev) => ({
        ...prev,
        location: formatPinLine(lat, lng, label),
      }))
    } catch {
      setFormData((prev) => ({
        ...prev,
        location: formatPinLine(lat, lng, null),
      }))
    } finally {
      setLocFetching(false)
    }
  }

  const fetchCurrentLocation = useCallback(async () => {
    if (!('geolocation' in navigator)) {
      toast.error('Location is not supported in this browser')
      return
    }

    setLocFetching(true)
    try {
      const { lat, lng, accuracyM } = await getRefinedPosition()
      // Pass 'gps' so the map knows to fly here
      await updateLocationData(lat, lng, 'gps')

      const accNote = accuracyM < 9999 ? ` (~${Math.round(accuracyM)} m accuracy)` : ''
      toast.success(`Location captured${accNote}`)
    } catch (err: unknown) {
      setLocFetching(false) 
      const geoErr = err as GeolocationPositionError
      if (geoErr?.code === geoErr?.PERMISSION_DENIED) {
        toast.error('Location permission denied. Enable location or enter the address manually.')
      } else if (geoErr?.code === geoErr?.POSITION_UNAVAILABLE) {
        toast.error('Location unavailable. Try outdoors or check device settings.')
      } else {
        toast.error('Could not get an accurate location. Try again or enter it manually.')
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please log in to submit a report')
      return
    }
    if (!formData.species.trim() || !formData.location || !formData.description) {
      toast.error('Please fill in all required fields')
      return
    }
    const photoError = validateReportPhotosForSubmit(photos)
    if (photoError) {
      toast.error(photoError)
      return
    }

    if (profile === undefined) {
      toast.error('Still loading your account details. Please try again.')
      return
    }

    const contactPhone = formData.reporterPhone.trim()
    
    if (!contactPhone) {
      toast.error('Contact number is required')
      return
    }

    const cleanPhone = contactPhone.replace(/\D/g, '')
    if (!/^09\d{9}$/.test(cleanPhone)) {
      toast.error('Contact number must be exactly 11 digits and start with "09"')
      return
    }

    setLoading(true)

    const descriptionParts = [formData.description]
    if (formData.color) {
      descriptionParts.unshift(`Color/markings: ${formData.color}`)
    }

    try {
      const seenAt = formData.seenAt
        ? new Date(formData.seenAt).getTime()
        : Date.now()

      await createReportMutation({
        userEmail: user.email,
        category: 'domestic',
        type: reportType,
        animalName:
          formData.animalName ||
          (reportType === 'missing' ? 'Unknown Pet' : 'Stray/Found Animal'),
        location: formData.location,
        description: descriptionParts.join('\n\n'),
        speciesId: formData.species.trim(),
        reporterPhone: cleanPhone,
        quantity: Math.max(1, Number(formData.quantity) || 1),
        reportedSize: formData.reportedSize.trim() || undefined,
        seenAt,
        photoStorageIds: photoStorageIdsForSubmit(photos),
        latitude: coords?.lat,
        longitude: coords?.lng,
      })
      navigate('/report/success')
    } catch {
      toast.error('Could not submit report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
      
      <div className="mb-8 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p>
          <strong className="font-semibold text-foreground">Important Note:</strong> This report concerns domestic animals. Please note that domestic animal rescue and shelter services are managed by <strong>Nativity's Stray Rescue Shelter</strong>, not PWRCC.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          Domestic Animal Report
        </h2>
        <p className="text-sm text-muted-foreground">
          Report a missing pet, found animal, stray, or injured domestic animal (dogs, cats, etc).
        </p>
      </div>

      <Tabs value={reportType} onValueChange={setReportType} className="mb-8 w-full">
        <TabsList className="grid w-full grid-cols-4 bg-background border border-border h-12 p-1">
          <TabsTrigger value="missing" className="h-full rounded-lg text-xs aria-selected:bg-primary aria-selected:text-primary-foreground">Missing</TabsTrigger>
          <TabsTrigger value="found" className="h-full rounded-lg text-xs aria-selected:bg-primary aria-selected:text-primary-foreground">Found</TabsTrigger>
          <TabsTrigger value="stray" className="h-full rounded-lg text-xs aria-selected:bg-primary aria-selected:text-primary-foreground">Stray</TabsTrigger>
          <TabsTrigger value="injured" className="h-full rounded-lg text-xs aria-selected:bg-primary aria-selected:text-primary-foreground">Injured</TabsTrigger>
        </TabsList>
      </Tabs>

      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Species <span className="text-destructive">*</span>
            </label>
            <Input
              value={formData.species}
              onChange={(e) => setFormData({ ...formData, species: e.target.value })}
              placeholder="e.g. Dog, Cat, Bird"
              className="h-12 bg-background border-border rounded-xl"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {reportType === 'missing' ? "Pet's Name *" : 'Name (if known)'}
            </label>
            <Input
              value={formData.animalName}
              onChange={(e) => setFormData({ ...formData, animalName: e.target.value })}
              placeholder="e.g. Bella"
              className="h-12 bg-background border-border rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Color / Markings
            </label>
            <Input
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="e.g. Black with white paws"
              className="h-12 bg-background border-border rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Location <span className="text-destructive">*</span>
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <div className="relative flex-1 min-w-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Click the map, use GPS, or describe..."
                className="pl-10 h-12 bg-background border-border rounded-xl pr-3"
                required
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={fetchCurrentLocation}
              disabled={locFetching}
              className="h-12 shrink-0 px-4 rounded-xl border-border bg-background sm:w-auto"
            >
              {locFetching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Crosshair className="mr-2 h-4 w-4" />
              )}
              Current location
            </Button>
          </div>

          <div className={cn(
            'overflow-hidden rounded-xl border border-border bg-muted/30 relative z-0 h-[260px]',
          )}>
            <MapContainer
              center={coords ? [coords.lat, coords.lng] : [DEFAULT_MAP_LAT, DEFAULT_MAP_LNG]}
              zoom={13}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%', zIndex: 0 }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ClickableMap 
                coords={coords} 
                onMapClick={(lat, lng) => updateLocationData(lat, lng, 'click')} 
              />
            </MapContainer>
          </div>
          
          <p className="text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground">Interactive Map:</span> You can manually tap/click anywhere on the map above to drop a pin and auto-fill the address.
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Date & Time Seen
          </label>
          <Input
            type="datetime-local"
            value={formData.seenAt}
            onChange={(e) => setFormData({ ...formData, seenAt: e.target.value })}
            className="h-12 bg-background border-border rounded-xl"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Reported Quantity
            </label>
            <Input
              type="number"
              min={1}
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="h-12 bg-background border-border rounded-xl"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Reported Size
            </label>
            <Input
              value={formData.reportedSize}
              onChange={(e) => setFormData({ ...formData, reportedSize: e.target.value })}
              placeholder="e.g. Small, medium"
              className="h-12 bg-background border-border rounded-xl"
            />
          </div>
        </div>

        {user ? (
          <ReportContactField
            userEmail={user.email}
            value={formData.reporterPhone}
            onChange={(val) => {
              let cleaned = val.replace(/\D/g, '')
              if (cleaned.length > 11) {
                cleaned = cleaned.slice(0, 11)
              }
              setFormData({ ...formData, reporterPhone: cleaned })
            }}
          />
        ) : null}

        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Additional Details <span className="text-destructive">*</span>
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Provide any additional context about the animal..."
            className="min-h-[100px] bg-background border-border rounded-xl resize-none"
            required
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Photos <span className="text-destructive">*</span>
          </label>
          <ReportPhotoField value={photos} onChange={setPhotos} />
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-500/80 leading-relaxed">
            By submitting this report, it will be posted on the public Community Board to help locate or resolve the issue. Your email will be used for follow-up contact.
          </p>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Submit ${reportType} Report`}
        </Button>
      </form>
    </div>
  )
}
