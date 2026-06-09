import { useCallback, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Crosshair,
  Loader2,
  MapPin,
  Info,
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
import { useLanguage } from '@/context/LanguageContext'
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

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog.tsx'

const DEFAULT_MAP_LAT = 9.7393
const DEFAULT_MAP_LNG = 118.7361

const customMarkerIcon = L.divIcon({
  className: 'custom-map-marker',
  html: `<div style="background-color: hsl(var(--primary)); width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9], 
})

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

function ClickableMap({ 
  coords, 
  onMapClick 
}: { 
  coords: {lat: number, lng: number, source?: 'gps' | 'click'} | null, 
  onMapClick: (lat: number, lng: number) => void 
}) {
  const map = useMap()

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

export function WildlifeSightingForm() {
  const navigate = useNavigate()
  const { user } = useUserAuth()
  const { t } = useLanguage()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const createReportMutation = useMutation(api.reports.create)
  const profile = useQuery(
    api.users.getProfile,
    user ? { email: normalizeEmail(user.email) } : 'skip',
  )
  const [loading, setLoading] = useState(false)
  const [locFetching, setLocFetching] = useState(false)
  
  const [coords, setCoords] = useState<{ lat: number; lng: number; source?: 'gps' | 'click' } | null>(null)
  const [photos, setPhotos] = useState<ReportPhotoItem[]>([])

  const [formData, setFormData] = useState({
    species: '',
    location: '',
    description: '',
    behavior: '',
    behaviorOther: '',
    reporterPhone: '',
    quantity: '1',
    reportedSize: '' as string,
    seenAt: '',
  })

  const userContactPhone = profile?.contactPhone;

  useEffect(() => {
    if (userContactPhone && !formData.reporterPhone) {
      let cleaned = userContactPhone.replace(/\D/g, '')

      if (cleaned.length > 11) {
        cleaned = cleaned.slice(0, 11)
      }

      setFormData((prev) => ({
        ...prev,
        reporterPhone: cleaned,
      }))
    }
  }, [userContactPhone, formData.reporterPhone])

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
      toast.error(t('reportFormWildlife.errorLocationUnsupported'))
      return
    }

    setLocFetching(true)
    try {
      const { lat, lng, accuracyM } = await getRefinedPosition()
      await updateLocationData(lat, lng, 'gps')

      const accNote = accuracyM < 9999 ? ` (~${Math.round(accuracyM)} m accuracy)` : ''
      toast.success(`Location captured${accNote}`)
    } catch (err: unknown) {
      setLocFetching(false)
      const geoErr = err as GeolocationPositionError
      if (geoErr?.code === geoErr?.PERMISSION_DENIED) {
        toast.error(t('reportFormWildlife.errorLocationPermission'))
      } else if (geoErr?.code === geoErr?.POSITION_UNAVAILABLE) {
        toast.error(t('reportFormWildlife.errorLocationUnavailable'))
      } else {
        toast.error(t('reportFormWildlife.errorLocationInaccurate'))
      }
    }
  }, [t])

  const handleValidationBeforeSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error(t('reportFormWildlife.errorLoginRequired'))
      return
    }

    if (
      !formData.species.trim() ||
      !formData.location ||
      !formData.seenAt ||
      !formData.quantity ||
      !formData.reportedSize ||
      !formData.behavior ||
      !formData.description.trim()
    ) {
      toast.error(t('reportFormWildlife.errorRequiredFields') || 'Please fill in all required fields.')
      return
    }

    if (formData.behavior === WILDLIFE_BEHAVIOR_OTHER && !formData.behaviorOther.trim()) {
      toast.error(t('reportFormWildlife.errorBehaviorSpecify') || 'Please specify the other behavior.')
      return
    }

    if (!coords) {
      toast.error(t('reportFormWildlife.errorMapPinRequired') || 'Please drop a pin on the map or use the current location button to confirm the exact spot.')
      return
    }

    const photoError = validateReportPhotosForSubmit(photos)
    if (photoError) {
      toast.error(photoError)
      return
    }

    if (profile === undefined) {
      toast.error(t('reportFormWildlife.errorLoadingAccount'))
      return
    }

    const contactPhone = formData.reporterPhone.trim()
    if (!contactPhone) {
      toast.error(t('reportFormWildlife.errorContactRequired'))
      return
    }

    const cleanPhone = contactPhone.replace(/\D/g, '')
    if (!/^09\d{9}$/.test(cleanPhone)) {
      toast.error(t('reportFormWildlife.errorContactInvalid'))
      return
    }

    setConfirmOpen(true)
  }

  const executeSubmit = async () => {
    setLoading(true)
    try {
      const seenAt = formData.seenAt
        ? new Date(formData.seenAt).getTime()
        : Date.now()

      const behavior =
        formData.behavior === WILDLIFE_BEHAVIOR_OTHER
          ? formData.behaviorOther.trim()
          : wildlifeBehaviorLabelForValue(formData.behavior)

      const contactPhone = formData.reporterPhone.trim()
      const cleanPhone = contactPhone.replace(/\D/g, '')

      await createReportMutation({
        userEmail: user!.email,
        category: 'wildlife',
        type: 'wildlife-sighting',
        animalName: formData.species.trim(),
        location: formData.location,
        description: formData.description,
        behavior: behavior || undefined,
        reporterPhone: cleanPhone,
        quantity: Math.max(1, Number(formData.quantity) || 1),
        reportedSize: formData.reportedSize.trim(),
        seenAt,
        photoStorageIds: photoStorageIdsForSubmit(photos),
        latitude: coords!.lat,
        longitude: coords!.lng,
      })
      setConfirmOpen(false)
      navigate('/report/success')
    } catch {
      toast.error(t('reportFormWildlife.errorSubmit'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
      
      {/* Important Note Matched to Domestic Design */}
      <div className="mb-8 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p>
          <strong className="font-semibold text-foreground">
            {t('reportFormWildlife.reminder')}
          </strong>{' '}
          {t('reportFormWildlife.reminderText1')}{' '}
          <strong className="font-semibold text-foreground">
            {t('reportFormWildlife.reminderText2')}
          </strong>{' '}
          {t('reportFormWildlife.reminderText3')}{' '}
          <strong className="font-semibold text-foreground">
            {t('reportFormWildlife.reminderText4')}
          </strong>{' '}
          {t('reportFormWildlife.reminderText5')}
          <span className="block mt-3 text-muted-foreground font-normal">
            {t('reportFormWildlife.reminderText6')}
          </span>
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          {t('reportFormWildlife.title')}
        </h2>
      </div>

      <form onSubmit={handleValidationBeforeSubmit} className="space-y-6">

        {/* Species */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t('reportFormWildlife.speciesLabel')} <span className="text-destructive">*</span>
          </label>
          <Input
            value={formData.species}
            onChange={(e) =>
              setFormData({
                ...formData,
                species: e.target.value,
              })
            }
            placeholder={t('reportFormWildlife.speciesPlaceholder')}
            className="h-12 bg-background border-border rounded-xl"
            required
          />
        </div>

        {/* Location */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t('reportFormWildlife.locationLabel')} <span className="text-destructive">*</span>
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
                placeholder={t('reportFormWildlife.locationPlaceholder')}
                className="pl-10 h-12 bg-background border-border rounded-xl pr-3 cursor-not-allowed opacity-80"
                required
                readOnly
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
              {t('reportFormWildlife.currentLocation')}
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
            {t('reportFormWildlife.mapHelper')}
          </p>
        </div>

        {/* Date & time seen */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t('reportFormWildlife.dateLabel')} <span className="text-destructive">*</span>
          </label>
          <Input
            type="datetime-local"
            value={formData.seenAt}
            onChange={(e) => setFormData({ ...formData, seenAt: e.target.value })}
            className="h-12 bg-background border-border rounded-xl"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t('reportFormWildlife.quantityLabel')} <span className="text-destructive">*</span>
            </label>
            <Input
              type="number"
              min={1}
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="h-12 bg-background border-border rounded-xl"
              required
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t('reportFormWildlife.sizeLabel')} <span className="text-destructive">*</span>
            </label>
            <Select
              value={formData.reportedSize}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  reportedSize: value || '',
                })
              }
              required
            >
              <SelectTrigger className="h-12 bg-background border-border rounded-xl">
                <SelectValue placeholder={t('reportFormWildlife.sizePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">
                  {t('reportFormWildlife.sizeSmall')}
                </SelectItem>
                <SelectItem value="medium">
                  {t('reportFormWildlife.sizeMedium')}
                </SelectItem>
                <SelectItem value="large">
                  {t('reportFormWildlife.sizeLarge')}
                </SelectItem>
                <SelectItem value="very-large">
                  {t('reportFormWildlife.sizeVeryLarge')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t('reportFormWildlife.behaviorLabel')} <span className="text-destructive">*</span>
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
            required
          >
            <SelectTrigger className="h-12 bg-background border-border rounded-xl [&_[data-slot=select-value]]:line-clamp-none">
              <SelectValue placeholder={t('reportFormWildlife.behaviorPlaceholder')}>
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
              placeholder={t('reportFormWildlife.behaviorOtherPlaceholder')}
              className="h-12 bg-background border-border rounded-xl mt-2"
              required
            />
          ) : null}
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

        {/* Description */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t('reportFormWildlife.detailsLabel')} <span className="text-destructive">*</span>
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder={t('reportFormWildlife.detailsPlaceholder')}
            className="min-h-[100px] bg-background border-border rounded-xl resize-none"
            required
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t('reportFormWildlife.photosLabel')} <span className="text-destructive">*</span>
          </label>
          <ReportPhotoField value={photos} onChange={setPhotos} />
        </div>

        {/* Warning */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-500/80 leading-relaxed">
            {t('reportFormWildlife.warningText')}
          </p>
        </div>
        
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('reportFormWildlife.submitButton')}
        </Button>
      </form>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              Important Reminder
            </AlertDialogTitle>

            <AlertDialogDescription className="space-y-3 pt-2 text-sm leading-relaxed text-muted-foreground">
              <p>
                Your wildlife report will only be accepted and reviewed properly
                if you answer calls from the rescue team or administrators.
              </p>

              <p>
                Please make sure your contact number is active and reachable.
              </p>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-700 dark:text-amber-300">
                Failure to answer verification calls may result in your report
                being rejected.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction onClick={executeSubmit}>
              Continue Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
