import { useCallback, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, AlertTriangle, Loader2, Info, Crosshair } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Guard: ensure stale _leaflet_id never blocks map re-initialization.
// React 19 StrictMode + callback refs can leave _leaflet_id on the container
// after the simulated unmount cleans up the map, causing Leaflet to throw
// "Map container is already initialized" on remount.
if (!(L as any).__containerPatched) {
  const origInitContainer = (L.Map.prototype as any)._initContainer
  ;(L.Map.prototype as any)._initContainer = function (id: any) {
    const container = L.DomUtil.get(id)
    if (container && (container as any)._leaflet_id) {
      ;(container as any).innerHTML = ''
      delete (container as any)._leaflet_id
    }
    return origInitContainer.call(this, id)
  }
  ;(L as any).__containerPatched = true
}

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'

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

export function DomesticReportForm() {
  const navigate = useNavigate()
  const { user } = useUserAuth()
  const { t } = useLanguage()
  const createReportMutation = useMutation(api.reports.create)
  const profile = useQuery(
    api.users.getProfile,
    user ? { email: normalizeEmail(user.email) } : 'skip',
  )
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [locFetching, setLocFetching] = useState(false)
  const [reportType, setReportType] = useState('missing')
  const [photos, setPhotos] = useState<ReportPhotoItem[]>([])
  
  const [coords, setCoords] = useState<{ lat: number; lng: number; source?: 'gps' | 'click' } | null>(null)

  const [formData, setFormData] = useState({
    species: '',
    animalName: '',
    color: '',
    condition: '',
    behavior: '',
    location: '',
    description: '',
    reporterPhone: '',
    reportedSize: '',
    seenAt: '',
  })

  const userContactPhone = profile?.contactPhone;
  const hasPrefilledPhone = useRef(false);

  useEffect(() => {
    if (userContactPhone && !hasPrefilledPhone.current) {
      setFormData((prev) => {
        let cleaned = userContactPhone.replace(/\D/g, '')
        if (cleaned.length > 11) cleaned = cleaned.slice(0, 11)
        return { ...prev, reporterPhone: cleaned }
      })
      hasPrefilledPhone.current = true;
    }
  }, [userContactPhone])

  const updateLocationData = useCallback(async (lat: number, lng: number, source: 'gps' | 'click' = 'click') => {
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
  }, [])

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
  }, [t, updateLocationData])

  const handleValidationBeforeSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error(t('reportFormWildlife.errorLoginRequired'))
      return
    }

    // 1. Check Global Fields
    if (!formData.species.trim() || !formData.location || !formData.seenAt) {
      toast.error(t('reportFormWildlife.errorRequiredFields') || 'Please fill in all required fields.')
      return
    }

    // 2. Check Conditional Fields based on reportType
    if (reportType === 'injured') {
      if (
        !formData.condition || 
        !formData.behavior || 
        !formData.reportedSize || 
        !formData.description.trim() || 
        !formData.color
      ) {
        toast.error(t('reportFormWildlife.errorRequiredFields') || 'Please fill in all required fields.')
        return
      }
    } else {
      // Missing, Found, Stray
      if (!formData.color.trim() || !formData.reportedSize || !formData.description.trim()) {
        toast.error(t('reportFormWildlife.errorRequiredFields') || 'Please fill in all required fields.')
        return
      }
      
      // Pet Name is only required for 'missing' reports
      if (reportType === 'missing' && !formData.animalName.trim()) {
        toast.error(t('reportFormWildlife.errorRequiredFields') || 'Please fill in all required fields.')
        return
      }
    }

    // 3. Map Pin Verification
    if (!coords) {
      toast.error(t('reportFormDomestic.errorMapPinRequired') || 'Please drop a pin on the map to provide an exact location.')
      return
    }

    // 4. Photo Verification
    const photoError = validateReportPhotosForSubmit(photos)
    if (photoError) {
      toast.error(photoError)
      return
    }

    if (profile === undefined) {
      toast.error(t('reportFormWildlife.errorLoadingAccount'))
      return
    }

    // 5. Contact Verification
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

    // If everything is perfectly filled out, open confirmation modal
    setConfirmOpen(true)
  }

  const executeSubmit = async () => {
    setLoading(true)

    try {
      const seenAt = formData.seenAt
        ? new Date(formData.seenAt).getTime()
        : Date.now()

      const contactPhone = formData.reporterPhone.trim()
      const cleanPhone = contactPhone.replace(/\D/g, '')

      await createReportMutation({
        userEmail: user!.email,
        category: 'domestic',
        type: reportType,
        animalName:
          formData.animalName ||
          (reportType === 'missing' ? 'Unknown Pet' : 'Stray/Found Animal'),
        location: formData.location,
        description: formData.description,
        speciesId: formData.species.trim(),
        reporterPhone: cleanPhone,
        phone: cleanPhone,
        reporterName: profile?.firstName ? `${profile.firstName} ${profile.lastName}`.trim() : '',
        color: formData.color || undefined,
        condition: formData.condition || undefined,
        behavior: formData.behavior || undefined,
        reportedSize: formData.reportedSize.trim() || undefined,
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
      
      <div className="mb-8 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p>
          <strong className="font-semibold text-foreground">{t('reportFormDomestic.importantNote')}</strong> {t('reportFormDomestic.importantText')}
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          {t('reportFormDomestic.title')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('reportFormDomestic.subtitle')}
        </p>
      </div>

      <Tabs value={reportType} onValueChange={setReportType} className="mb-8 w-full">
        <TabsList className="grid w-full grid-cols-4 bg-background border border-border h-12 p-1">
          <TabsTrigger value="missing" className="h-full rounded-lg text-xs aria-selected:bg-primary aria-selected:text-primary-foreground">{t('reportFormDomestic.tabMissing')}</TabsTrigger>
          <TabsTrigger value="found" className="h-full rounded-lg text-xs aria-selected:bg-primary aria-selected:text-primary-foreground">{t('reportFormDomestic.tabFound')}</TabsTrigger>
          <TabsTrigger value="stray" className="h-full rounded-lg text-xs aria-selected:bg-primary aria-selected:text-primary-foreground">{t('reportFormDomestic.tabStray')}</TabsTrigger>
          <TabsTrigger value="injured" className="h-full rounded-lg text-xs aria-selected:bg-primary aria-selected:text-primary-foreground">{t('reportFormDomestic.tabInjured')}</TabsTrigger>
        </TabsList>
      </Tabs>

      <form onSubmit={handleValidationBeforeSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t('reportFormDomestic.speciesLabel')} <span className="text-destructive">*</span>
            </label>
            <Input
              value={formData.species}
              onChange={(e) => setFormData({ ...formData, species: e.target.value })}
              placeholder={t('reportFormDomestic.speciesPlaceholder')}
              className="h-12 bg-background border-border rounded-xl"
              required
            />
          </div>

          {reportType === 'stray' ? (
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t('reportFormDomestic.sizeLabel')} <span className="text-destructive">*</span>
              </label>

              <Select
                value={formData.reportedSize}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    reportedSize: value ?? '',
                  })
                }
                required
              >
                <SelectTrigger className="h-12 bg-background border-border rounded-xl">
                  <SelectValue placeholder={t('reportFormDomestic.sizePlaceholder')} />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="small">{t('reportFormDomestic.sizeSmall')}</SelectItem>
                  <SelectItem value="medium">{t('reportFormDomestic.sizeMedium')}</SelectItem>
                  <SelectItem value="large">{t('reportFormDomestic.sizeLarge')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : reportType === 'injured' ? (
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t('reportFormDomestic.colorLabel')} <span className="text-destructive">*</span>
              </label>

              <Input
                value={formData.color}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    color: e.target.value,
                  })
                }
                placeholder={t('reportFormDomestic.colorPlaceholder')}
                className="h-12 bg-background border-border rounded-xl"
                required
              />
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {reportType === 'missing' ? t('reportFormDomestic.petNameLabel') : t('reportFormDomestic.nameLabel')}
                {reportType === 'missing' && <span className="text-destructive"> *</span>}
              </label>

              <Input
                value={formData.animalName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    animalName: e.target.value,
                  })
                }
                placeholder={t('reportFormDomestic.namePlaceholder')}
                className="h-12 bg-background border-border rounded-xl"
                required={reportType === 'missing'}
              />
            </div>
          )}
        </div>

        {reportType !== 'injured' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          <div className={cn('space-y-3', reportType === 'stray' && 'sm:col-span-2')}>
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t('reportFormDomestic.colorLabel')} <span className="text-destructive">*</span>
            </label>

            <Input
              value={formData.color}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  color: e.target.value,
                })
              }
              placeholder={t('reportFormDomestic.colorPlaceholder')}
              className="h-12 bg-background border-border rounded-xl"
              required
            />
          </div>

          {reportType !== 'stray' && (
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t('reportFormDomestic.sizeLabel')} <span className="text-destructive">*</span>
              </label>

              <Select
                value={formData.reportedSize}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    reportedSize: value ?? '',
                  })
                }
                required
              >
                <SelectTrigger className="h-12 bg-background border-border rounded-xl">
                  <SelectValue placeholder={t('reportFormDomestic.sizePlaceholder')} />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="small">{t('reportFormDomestic.sizeSmall')}</SelectItem>
                  <SelectItem value="medium">{t('reportFormDomestic.sizeMedium')}</SelectItem>
                  <SelectItem value="large">{t('reportFormDomestic.sizeLarge')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

        </div>
        )}
        
        {reportType === 'injured' && (
          <div className="space-y-6">

            {/* ── Injury Details ── */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <span className="bg-card px-3">Injury Details</span>
              </div>
            </div>

            {/* Nature of Injury */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t('reportFormDomestic.injuryLabel')} <span className="text-destructive">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {[
                  t('reportFormDomestic.injuryOpenWound'),
                  t('reportFormDomestic.injuryBrokenBone'),
                  t('reportFormDomestic.injuryLimping'),
                  t('reportFormDomestic.injuryHitByVehicle'),
                  t('reportFormDomestic.injuryBurn'),
                  t('reportFormDomestic.injuryTrapped'),
                  t('reportFormDomestic.injuryEye'),
                  t('reportFormDomestic.injuryHead'),
                  t('reportFormDomestic.injuryBite'),
                  t('reportFormDomestic.injurySkin'),
                  t('reportFormDomestic.injuryUnconscious'),
                  t('reportFormDomestic.injuryBreathing'),
                  t('reportFormDomestic.injuryWeak'),
                  t('reportFormDomestic.injuryPoisoning'),
                ].map((injury) => (
                  <label
                    key={injury}
                    className="flex items-center gap-2 rounded-xl border border-border bg-background p-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={formData.condition.includes(injury)}
                      onChange={(e) => {
                        const current =
                          formData.condition
                            ? formData.condition.split(', ')
                            : []

                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            condition: [...current, injury].join(', '),
                          })
                        } else {
                          setFormData({
                            ...formData,
                            condition: current
                              .filter((i) => i !== injury)
                              .join(', '),
                          })
                        }
                      }}
                    />

                    <span>{injury}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Severity of Injury */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t('reportFormDomestic.severityLabel')} <span className="text-destructive">*</span>
              </label>

              <Select
                value={formData.behavior}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    behavior: value ?? '',
                  })
                }
                required
              >
                <SelectTrigger className="h-12 rounded-xl border-border bg-background">
                  <SelectValue placeholder={t('reportFormDomestic.severityPlaceholder')} />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="critical">
                    {t('reportFormDomestic.severityCritical')}
                  </SelectItem>

                  <SelectItem value="urgent">
                    {t('reportFormDomestic.severityUrgent')}
                  </SelectItem>

                  <SelectItem value="moderate">
                    {t('reportFormDomestic.severityModerate')}
                  </SelectItem>

                  <SelectItem value="minor">
                    {t('reportFormDomestic.severityMinor')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Current Condition */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t('reportFormDomestic.conditionLabel')} <span className="text-destructive">*</span>
              </label>

              <Select
                value={formData.reportedSize}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    reportedSize: value ?? '',
                  })
                }
                required
              >
                <SelectTrigger className="h-12 rounded-xl border-border bg-background">
                  <SelectValue placeholder={t('reportFormDomestic.conditionPlaceholder')} />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="alert">
                    {t('reportFormDomestic.conditionAlert')}
                  </SelectItem>

                  <SelectItem value="frightened">
                    {t('reportFormDomestic.conditionFrightened')}
                  </SelectItem>

                  <SelectItem value="weak">
                    {t('reportFormDomestic.conditionWeak')}
                  </SelectItem>

                  <SelectItem value="unable">
                    {t('reportFormDomestic.conditionUnable')}
                  </SelectItem>

                  <SelectItem value="unconscious">
                    {t('reportFormDomestic.conditionUnconscious')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Additional Information */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t('reportFormDomestic.additionalInfoLabel')} <span className="text-destructive">*</span>
              </label>

              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                placeholder={t('reportFormDomestic.additionalInfoPlaceholder')}
                className="min-h-[100px] rounded-xl border-border bg-background resize-none"
                required
              />
            </div>

            {/* Rescue Assistance Priority */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t('reportFormDomestic.priorityLabel')} <span className="text-destructive">*</span>
              </label>

              <Select
                value={formData.color}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    color: value ?? '',
                  })
                }
                required
              >
                <SelectTrigger className="h-12 rounded-xl border-border bg-background">
                  <SelectValue placeholder={t('reportFormDomestic.priorityPlaceholder')} />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="critical">
                    {t('reportFormDomestic.priorityCritical')}
                  </SelectItem>

                  <SelectItem value="urgent">
                    {t('reportFormDomestic.priorityUrgent')}
                  </SelectItem>

                  <SelectItem value="moderate">
                    {t('reportFormDomestic.priorityModerate')}
                  </SelectItem>

                  <SelectItem value="low">
                    {t('reportFormDomestic.priorityLow')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>
        )}

        {/* ── Location & Date ── */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <span className="bg-card px-3">Location &amp; Date</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t('reportFormDomestic.locationLabel')} <span className="text-destructive">*</span>
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <div className="relative flex-1 min-w-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                value={formData.location}
                readOnly
                placeholder={t('reportFormDomestic.locationPlaceholder')}
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
              {t('reportFormDomestic.currentLocation')}
            </Button>
          </div>

          <div className={cn(
            'overflow-hidden rounded-xl border border-border bg-muted/30 relative z-0 h-[260px]',
          )}>
            <MapContainer
              key="domestic-map"
              center={coords ? [coords.lat, coords.lng] : [DEFAULT_MAP_LAT, DEFAULT_MAP_LNG]}
              zoom={13}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%', zIndex: 0 }}
            >
              <TileLayer
                attribution='© <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ClickableMap 
                coords={coords} 
                onMapClick={(lat, lng) => updateLocationData(lat, lng, 'click')} 
              />
            </MapContainer>
          </div>
          
          <p className="text-[11px] text-muted-foreground">
            {t('reportFormDomestic.mapHelper')}
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t('reportFormDomestic.dateLabel')} <span className="text-destructive">*</span>
          </label>
          <Input
            type="datetime-local"
            value={formData.seenAt}
            onChange={(e) => setFormData({ ...formData, seenAt: e.target.value })}
            className="h-12 bg-background border-border rounded-xl"
            required
          />
        </div>

        {/* ── Description & Media ── */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <span className="bg-card px-3">Description &amp; Media</span>
          </div>
        </div>

        {reportType !== 'injured' && (
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t('reportFormDomestic.detailsLabel')} <span className="text-destructive">*</span>
            </label>

            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              placeholder={t('reportFormDomestic.detailsPlaceholder')}
              className="min-h-[100px] bg-background border-border rounded-xl resize-none"
              required
            />
          </div>
        )}

        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t('reportFormDomestic.photosLabel')} <span className="text-destructive">*</span>
          </label>
          <ReportPhotoField value={photos} onChange={setPhotos} />
        </div>

        {/* ── Contact & Submit ── */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <span className="bg-card px-3">Contact &amp; Submit</span>
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

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-500/80 leading-relaxed">
            {t('reportFormDomestic.warningText')}
          </p>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('reportFormDomestic.submitButton').replace('{type}', reportType)}
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
                Your domestic report will only be properly reviewed if
                you answer calls from rescue staff or administrators.
              </p>

              <p>
                Please make sure your contact number is active and reachable.
              </p>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-700 dark:text-amber-300">
                Failure to answer verification calls may result in your
                report being rejected.
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

