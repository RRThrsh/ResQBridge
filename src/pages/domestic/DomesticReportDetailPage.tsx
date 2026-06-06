import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import {
  CheckCircle2,
  Loader2,
  MapPin,
  Phone,
  User,
  Check,
  X,
  ExternalLink,
} from 'lucide-react'

import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

import { ConfirmDialog } from '@/components/ConfirmDialog'
import { RescuerDetailSection } from '@/components/rescuer/RescuerDetailSection'
import { DomesticLayout } from '@/components/domestic/DomesticLayout'
import { RescuerStatusBadge } from '@/components/rescuer/RescuerStatusBadge'
import { useDomesticAuth } from '@/context/DomesticAuthContext'
import { formatDateTime } from '@/lib/dates'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function DomesticReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>()
  const { domesticApprover } = useDomesticAuth()

  const [loading, setLoading] = useState(false)
  const [confirmApprove, setConfirmApprove] = useState(false)
  const [confirmReject, setConfirmReject] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // @ts-ignore
  const updateStatus = useMutation((api as any).reports.update)

  // @ts-ignore
  const row = useQuery(
    (api as any).reports.getReportById,
    reportId ? { reportId: reportId as Id<'reports'> } : 'skip'
  )

  if (!domesticApprover || row === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!row) {
    return (
      <DomesticLayout title="Report" backTo="/pwrcc/domestic">
        <p className="py-12 text-center text-sm text-muted-foreground">
          Report not found.
        </p>
      </DomesticLayout>
    )
  }

  const rawData = row as any

  // ---------------------------------------------------------
  // ALL PHOTOS
  // ---------------------------------------------------------

  let allPhotos: string[] = []

  if (rawData.photoDataUrls && Array.isArray(rawData.photoDataUrls)) {
    allPhotos = rawData.photoDataUrls
  } else if (rawData.photos && Array.isArray(rawData.photos)) {
    allPhotos = rawData.photos
  } else if (rawData.photoUrl) {
    allPhotos = [rawData.photoUrl]
  }

  // ---------------------------------------------------------
  // REPORTER NAME FIX
  // ---------------------------------------------------------

  let fName = rawData.reporterFirstName || rawData.firstName || ''
  let lName = rawData.reporterLastName || rawData.lastName || ''

  if (fName === 'undefined') fName = ''
  if (lName === 'undefined') lName = ''

  let reporterName = `${fName} ${lName}`.trim()

  if (
    !reporterName ||
    reporterName === 'undefined' ||
    reporterName === 'undefined undefined'
  ) {
    reporterName =
      rawData.reporterName ||
      rawData.userName ||
      rawData.name ||
      rawData.userEmail?.split('@')[0] ||
      'Unknown Reporter'
  }

  // ---------------------------------------------------------
  // LOCATION
  // ---------------------------------------------------------

  const locationString = rawData.location || 'Unknown location'

  let mapQuery = encodeURIComponent(locationString)

  if (locationString.includes('·')) {
    const coords = locationString.split('·').pop()?.trim()

    if (coords) {
      mapQuery = encodeURIComponent(coords)
    }
  } else if (rawData.latitude && rawData.longitude) {
    mapQuery = encodeURIComponent(
      `${rawData.latitude},${rawData.longitude}`
    )
  }

  const mapLink = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`

  const canAct = rawData.status === 'pending'

  async function handleStatusChange(
    newStatus: 'published' | 'rejected'
  ) {
    if (!domesticApprover || !row) return

    setLoading(true)

    try {
      await updateStatus({
        reportId: rawData._id as Id<'reports'>,
        userEmail: rawData.userEmail || rawData.email,
        animalName: rawData.animalName,
        location: rawData.location,
        type: rawData.type || rawData.animalType,
        status: newStatus as any,
      })

      toast.success(
        `Report ${
          newStatus === 'published'
            ? 'published to public feed'
            : 'rejected'
        }.`
      )

      setConfirmApprove(false)
      setConfirmReject(false)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not update report status'
      )
    } finally {
      setLoading(false)
    }
  }

  const actionFooter = canAct ? (
    <div className="mx-auto max-w-2xl space-y-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 flex gap-2">
      <Button
        type="button"
        variant="outline"
        className="h-12 flex-1 rounded-xl border-destructive/40 text-base font-semibold text-destructive hover:bg-destructive/10"
        disabled={loading}
        onClick={() => setConfirmReject(true)}
      >
        <X className="mr-2 h-5 w-5" />
        Reject
      </Button>

      <Button
        type="button"
        className="h-12 flex-1 rounded-xl bg-emerald-600 text-base font-semibold hover:bg-emerald-700 text-white"
        disabled={loading}
        onClick={() => setConfirmApprove(true)}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <Check className="mr-2 h-5 w-5" />
            Approve & Publish
          </>
        )}
      </Button>
    </div>
  ) : undefined

  return (
    <DomesticLayout
      title={rawData.animalName || 'Domestic Report'}
      subtitle={rawData.reportNumber ?? undefined}
      backTo="/pwrcc/domestic"
      footer={actionFooter}
    >
      <div className="space-y-6 pb-2">

        <div className="text-center">
          <RescuerStatusBadge
            status={rawData.status as any}
            className="mb-4"
          />

          <p className="text-xs font-mono text-muted-foreground">
            {rawData.reportNumber ?? rawData._id}
          </p>
        </div>

        {/* PHOTOS */}

        {allPhotos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {allPhotos.map((url, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-border bg-muted/30"
              >
                <img
                  src={url}
                  alt={`${rawData.animalName || 'Animal'} ${i + 1}`}
                  className="w-full h-48 cursor-pointer object-cover transition-transform duration-300 hover:scale-105"
                  onClick={() => setPreviewImage(url)}
                />
              </div>
            ))}
          </div>
        ) : null}

        {/* REPORT DETAILS */}

        <RescuerDetailSection
          title="Domestic Report Details"
          icon={CheckCircle2}
        >
          <dl className="space-y-3">

            <DetailRow
              label="Date & time seen"
              value={formatDateTime(
                rawData.seenAt ?? rawData._creationTime
              )}
            />

            <DetailRow
              label="Report Type"
              value={
                rawData.type ||
                rawData.animalType ||
                'Not specified'
              }
            />

            {rawData.animalName ? (
              <DetailRow
                label="Animal Name"
                value={rawData.animalName}
                capitalize={false}
              />
            ) : null}

            <DetailRow
              label="Species"
              value={rawData.speciesId || 'Not specified'}
            />

            {rawData.color ? (
              <DetailRow
                label="Color / Markings"
                value={rawData.color}
                capitalize={false}
              />
            ) : null}

            {rawData.quantity ? (
              <DetailRow
                label="Quantity"
                value={rawData.quantity.toString()}
              />
            ) : null}

            {rawData.reportedSize ? (
              <DetailRow
                label="Reported Size"
                value={rawData.reportedSize}
              />
            ) : null}

            {rawData.condition ? (
              <DetailRow
                label="Condition / Injuries"
                value={rawData.condition}
                capitalize={false}
                highlight
              />
            ) : null}

            {rawData.behavior ? (
              <DetailRow
                label="Behavior / Severity"
                value={rawData.behavior}
                capitalize={false}
              />
            ) : null}

            {rawData.latitude && rawData.longitude ? (
              <DetailRow
                label="Coordinates"
                value={`${rawData.latitude}, ${rawData.longitude}`}
                capitalize={false}
              />
            ) : null}

            {rawData.description ? (
              <DetailRow
                label="Description & Details"
                value={rawData.description}
                capitalize={false}
              />
            ) : null}

          </dl>
        </RescuerDetailSection>

        {/* LOCATION */}

        <RescuerDetailSection title="Location" icon={MapPin}>
          <div className="space-y-3">

            <p className="font-medium leading-relaxed text-sm">
              {locationString}
            </p>

            <div className="w-full overflow-hidden rounded-xl border border-border/50 bg-muted/30">
              <iframe
                src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <a
              href={mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline pt-1"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open in full Google Maps
            </a>

          </div>
        </RescuerDetailSection>

        {/* REPORTER */}

        <RescuerDetailSection title="Reporter" icon={User}>
          <dl className="space-y-3">

            <DetailRow
              label="Name"
              value={reporterName}
            />

            <div>
              <dt className="text-xs text-muted-foreground">
                Contact
              </dt>

              <dd className="mt-1 font-medium">
                {rawData.reporterPhone || rawData.phone ? (
                  <a
                    href={`tel:${(
                      rawData.reporterPhone ||
                      rawData.phone
                    ).replace(/\s/g, '')}`}
                    className="inline-flex items-center gap-2 text-primary hover:opacity-80"
                  >
                    {rawData.reporterPhone || rawData.phone}

                    <Phone className="h-4 w-4" />
                  </a>
                ) : (
                  'Not provided'
                )}
              </dd>
            </div>

          </dl>
        </RescuerDetailSection>

      </div>

      {/* APPROVE DIALOG */}

      <ConfirmDialog
        open={confirmApprove}
        onOpenChange={setConfirmApprove}
        title="Approve and Publish?"
        description="This will make the domestic report visible on the public feed."
        confirmLabel="Publish Report"
        confirmVariant="default"
        loading={loading}
        onConfirm={() => handleStatusChange('published')}
      />

      {/* REJECT DIALOG */}

      <ConfirmDialog
        open={confirmReject}
        onOpenChange={setConfirmReject}
        title="Reject Report?"
        description="This will decline the report and it will not be shown to the public."
        confirmLabel="Reject Report"
        loading={loading}
        onConfirm={() => handleStatusChange('rejected')}
      />

      {/* IMAGE PREVIEW */}

      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Preview"
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

    </DomesticLayout>
  )
}

function DetailRow({
  label,
  value,
  highlight,
  capitalize = true,
}: {
  label: string
  value: string
  highlight?: boolean
  capitalize?: boolean
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">
        {label}
      </dt>

      <dd
        className={`mt-0.5 font-medium whitespace-pre-wrap ${
          highlight
            ? 'text-primary'
            : 'text-foreground'
        } ${capitalize ? 'capitalize' : ''}`}
      >
        {value}
      </dd>
    </div>
  )
}
