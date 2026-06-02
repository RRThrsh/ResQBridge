import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Crosshair,
  Loader2,
  MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  WILDLIFE_BEHAVIOR_OTHER,
  WILDLIFE_BEHAVIORS,
  wildlifeBehaviorLabelForValue,
} from '@/lib/reports'
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

/** Default map center ~PWRCC Puerto Princesa until user fixes location via GPS */
const DEFAULT_MAP_LAT = 9.7393
const DEFAULT_MAP_LNG = 118.7361

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'DWARRMS Wildlife Report (contact@pwrcc.local)',
      },
    })
    if (!res.ok) return null
    const data = (await res.json()) as { display_name?: string }
    return data.display_name ?? null
  } catch {
    return null
  }
}

/** Collect GPS samples and keep the most accurate reading (smallest accuracy radius). */
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

function googleMapsEmbedUrl(lat: number, lng: number, zoom: number) {
  const q = encodeURIComponent(`${lat},${lng}`)
  return `https://www.google.com/maps?ll=${lat},${lng}&q=${q}&z=${zoom}&output=embed`
}

export function WildlifeSightingForm() {
  const navigate = useNavigate()
  const { user } = useUserAuth()
  const createReportMutation = useMutation(api.reports.create)
  const profile = useQuery(
    api.users.getProfile,
    user ? { email: normalizeEmail(user.email) } : 'skip',
  )
  const [loading, setLoading] = useState(false)
  const [locFetching, setLocFetching] = useState(false)
  const [formData, setFormData] = useState({
    species: '',
    location: '',
    description: '',
    condition: '',
    behavior: '',
    behaviorOther: '',
    reporterPhone: '',
    quantity: '1',
    reportedSize: '',
    seenAt: '',
  })

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [photos, setPhotos] = useState<ReportPhotoItem[]>([])

  const mapEmbedSrc =
    coords != null
      ? googleMapsEmbedUrl(coords.lat, coords.lng, 17)
      : googleMapsEmbedUrl(DEFAULT_MAP_LAT, DEFAULT_MAP_LNG, 12)

  const fetchCurrentLocation = useCallback(async () => {
    if (!('geolocation' in navigator)) {
      toast.error('Location is not supported in this browser')
      return
    }

    setLocFetching(true)
    try {
      const { lat, lng, accuracyM } = await getRefinedPosition()

      let label: string | null = null
      try {
        label = await reverseGeocode(lat, lng)
      } catch {
        label = null
      }

      setCoords({ lat, lng })
      setFormData((prev) => ({
        ...prev,
        location: formatPinLine(lat, lng, label),
      }))

      const accNote =
        accuracyM < 9999
          ? ` (~${Math.round(accuracyM)} m accuracy)`
          : ''
      toast.success(`Location captured${accNote}`)
    } catch (err: unknown) {
      const geoErr = err as GeolocationPositionError
      if (geoErr?.code === geoErr?.PERMISSION_DENIED) {
        toast.error('Location permission denied. Enable location or enter the address manually.')
      } else if (geoErr?.code === geoErr?.POSITION_UNAVAILABLE) {
        toast.error('Location unavailable. Try outdoors or check device settings.')
      } else {
        toast.error('Could not get an accurate location. Try again or enter it manually.')
      }
    } finally {
      setLocFetching(false)
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

    const savedContact = profile?.contactPhone?.trim()
    const contactPhone = savedContact || formData.reporterPhone.trim()
    if (!contactPhone) {
      toast.error('Contact number is required')
      return
    }

    if (!formData.behavior) {
      toast.error('Please select a condition or behavior')
      return
    }

    const behavior =
      formData.behavior === WILDLIFE_BEHAVIOR_OTHER
        ? formData.behaviorOther.trim()
        : wildlifeBehaviorLabelForValue(formData.behavior)

    if (
      formData.behavior === WILDLIFE_BEHAVIOR_OTHER &&
      (!behavior || behavior === wildlifeBehaviorLabelForValue(WILDLIFE_BEHAVIOR_OTHER))
    ) {
      toast.error('Please specify the condition or behavior')
      return
    }

    setLoading(true)
    try {
      const seenAt = formData.seenAt
        ? new Date(formData.seenAt).getTime()
        : Date.now()

      await createReportMutation({
        userEmail: user.email,
        category: 'wildlife',
        type: 'wildlife-sighting',
        animalName: formData.species.trim(),
        location: formData.location,
        description: formData.description,
        condition: formData.condition.trim() || undefined,
        behavior: behavior || undefined,
        reporterPhone: savedContact ? undefined : contactPhone,
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
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          Wildlife Sighting Report
        </h2>
        <p className="text-sm text-muted-foreground">
          Report a protected or endemic species sighting. Please keep your distance and do not disturb the animal.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Species */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Species Identified <span className="text-destructive">*</span>
          </label>
          <Input
            value={formData.species}
            onChange={(e) => setFormData({ ...formData, species: e.target.value })}
            placeholder="e.g. Palawan Bearcat, Philippine Cockatoo"
            className="h-12 bg-background border-border rounded-xl"
            required
          />
        </div>

        {/* Location */}
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
                placeholder="Describe the place or use current location…"
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
            'overflow-hidden rounded-xl border border-border bg-muted/30',
          )}>
            <iframe
              key={mapEmbedSrc}
              title={
                coords
                  ? `Map pin at ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
                  : 'Map — Puerto Princesa area'
              }
              src={mapEmbedSrc}
              width="100%"
              height={240}
              className="aspect-[21/10] max-h-[280px] w-full bg-muted grayscale-[30%]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          {coords && (
            <p className="text-[11px] font-mono text-muted-foreground">
              Map pin: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground">Current location</span> uses GPS for up to 10 seconds and picks the most accurate fix. The address and coordinates in the field match the pin on the map.
          </p>
        </div>

        {/* Date & time seen */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Date &amp; Time Seen
          </label>
          <Input
            type="datetime-local"
            value={formData.seenAt}
            onChange={(e) => setFormData({ ...formData, seenAt: e.target.value })}
            className="h-12 bg-background border-border rounded-xl"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
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

        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Condition / Behavior
          </label>
          <Select
            value={formData.behavior}
            onValueChange={(value) => {
              if (!value) return
              const preset = WILDLIFE_BEHAVIORS.find((item) => item.value === value)
              setFormData({
                ...formData,
                behavior: value,
                behaviorOther:
                  value === WILDLIFE_BEHAVIOR_OTHER ? (preset?.label ?? '') : '',
              })
            }}
          >
            <SelectTrigger className="h-12 bg-background border-border rounded-xl [&_[data-slot=select-value]]:line-clamp-none">
              <SelectValue placeholder="Select condition or behavior">
                {formData.behavior
                  ? wildlifeBehaviorLabelForValue(formData.behavior)
                  : null}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {WILDLIFE_BEHAVIORS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formData.behavior === WILDLIFE_BEHAVIOR_OTHER ? (
            <Input
              value={formData.behaviorOther}
              onChange={(e) =>
                setFormData({ ...formData, behaviorOther: e.target.value })
              }
              placeholder="Describe the condition or behavior"
              className="h-12 bg-background border-border rounded-xl"
              required
            />
          ) : null}
        </div>

        {user ? (
          <ReportContactField
            userEmail={user.email}
            value={formData.reporterPhone}
            onChange={(reporterPhone) => setFormData({ ...formData, reporterPhone })}
          />
        ) : null}

        {/* Condition */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Animal Condition (optional)
          </label>
          <Input
            value={formData.condition}
            onChange={(e) =>
              setFormData({ ...formData, condition: e.target.value })
            }
            placeholder="e.g. Appears healthy, injured, trapped"
            className="h-12 bg-background border-border rounded-xl"
          />
        </div>

        {/* Description */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Additional Details <span className="text-destructive">*</span>
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Provide any additional context about the sighting..."
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

        {/* Warning */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-500/80 leading-relaxed">
            By submitting this report, you confirm that the information provided is accurate to the best of your knowledge. False reports may be penalized.
          </p>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Sighting Report'}
        </Button>
      </form>
    </div>
  )
}
