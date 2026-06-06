import { useState } from 'react'
import { MapPin, Clock, Phone, Info, Navigation } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { VenueHoursStatusBadge } from '@/components/sections/VenueHoursStatusBadge'
import { useVenueHoursStatus } from '@/hooks/useVenueHoursStatus'
import { VENUE_HOURS_LABEL, VENUE_TIMEZONE } from '@/lib/venueHours'

const PWRCC_ADDRESS = 'Irawan, Puerto Princesa City, Palawan 5300'
const PWRCC_COORDS = { lat: 9.79938415802644, lng: 118.69127134046641 }

/** Google Maps embed for Palawan Wildlife Rescue and Conservation Center */
const MAP_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4790.308631983851!2d118.69127134046641!3d9.79938415802644!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33b5629567b1b68f%3A0x8de8a5031032b757!2sPalawan%20Wildlife%20Rescue%20and%20Conservation%20Center%20(Crocodile%20Farm)!5e0!3m2!1sen!2sph!4v1779783675493!5m2!1sen!2sph'

const MAP_DIRECTIONS_URL =
  'https://www.google.com/maps/dir/?api=1&destination=Palawan+Wildlife+Rescue+and+Conservation+Center,+Puerto+Princesa+City'

function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): { km: number; mi: number } {
  const R = 6371
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2
  const km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return { km, mi: km * 0.621371 }
}

export function MapSection() {
  const hoursStatus = useVenueHoursStatus()
  const [distance, setDistance] = useState<{ km: number; mi: number } | null>(null)
  const [distanceLoading, setDistanceLoading] = useState(false)
  const [distanceError, setDistanceError] = useState('')

  const handleGetDistance = () => {
    if (!navigator.geolocation) {
      setDistanceError('Geolocation is not supported by your browser.')
      return
    }
    setDistanceLoading(true)
    setDistanceError('')
    setDistance(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDistance(haversineDistance(
          pos.coords.latitude, pos.coords.longitude,
          PWRCC_COORDS.lat, PWRCC_COORDS.lng,
        ))
        setDistanceLoading(false)
      },
      (err) => {
        setDistanceError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied. Allow location access and try again.'
            : 'Could not retrieve your location. Try again.',
        )
        setDistanceLoading(false)
      },
    )
  }

  const infoItems = [
    { Icon: MapPin, label: 'Address', value: PWRCC_ADDRESS },
    {
      Icon: Clock,
      label: 'Operating Hours',
      value: VENUE_HOURS_LABEL,
      isHours: true as const,
    },
    { Icon: Phone, label: 'Contact', value: '09950338967' },
    {
      Icon: Info,
      label: 'In-Kind Donations',
      value: 'Fresh fruits, vegetables, vet supplies & daily necessities are welcome.',
    },
  ]

  return (
    <section id="map" className="py-24 bg-card border-y border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        {/* Header */}
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-primary">Find Us</p>
            <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              PWRCC Location
            </h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              Locate the Palawan Wildlife Rescue and Conservation Center in Puerto Princesa City.
            </p>
          </div>
          <VenueHoursStatusBadge
            snapshot={hoursStatus}
            showDetail
            className="sm:items-end sm:text-right"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:items-start">

          {/* Info column */}
          <div className="lg:col-span-2 space-y-3">
            {infoItems.map(({ Icon, label, value, ...rest }) => (
              <Card key={label} className="border-border bg-background">
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 border border-primary/15">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground">{label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{value}</p>
                    {'isHours' in rest && rest.isHours && (
                      <div className="mt-2 space-y-1.5">
                        <VenueHoursStatusBadge snapshot={hoursStatus} showDetail />
                        <p className="text-[10px] text-muted-foreground/80">
                          Times shown in {VENUE_TIMEZONE.replace('_', ' ')} (PHT)
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Distance from you */}
            <Card className="border-border bg-background">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 border border-primary/15">
                    <Navigation className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground">Distance from You</p>
                    {distance ? (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-muted-foreground">
                          You are <strong className="text-foreground">{distance.km.toFixed(1)} km</strong> ({distance.mi.toFixed(1)} mi) away from PWRCC.
                        </p>
                        <a
                          href={MAP_DIRECTIONS_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          Get directions
                        </a>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleGetDistance}
                          disabled={distanceLoading}
                          className="text-xs h-8 px-3"
                        >
                          {distanceLoading ? 'Locating...' : 'Check distance'}
                        </Button>
                        {distanceError && (
                          <p className="mt-1.5 text-xs text-destructive">{distanceError}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-xl border border-border bg-muted">
              <iframe
                title="PWRCC Location — Palawan Wildlife Rescue and Conservation Center"
                src={MAP_EMBED_URL}
                className="block h-[min(380px,50vh)] w-full min-h-[280px] border-0 brightness-[0.85] saturate-[1.1]"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <p className="mt-2 text-right text-xs text-muted-foreground">
              <span className="mr-2">{hoursStatus.detail}</span>
              <a
                href={MAP_DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:opacity-80 transition-opacity"
              >
                Open directions in Google Maps
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
