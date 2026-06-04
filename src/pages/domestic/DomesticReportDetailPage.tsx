import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import { CheckCircle2, Loader2, MapPin, Phone, User, Check, X, ExternalLink } from 'lucide-react'
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
  // 1. BULLETPROOF PHOTO RESOLVER
  // ---------------------------------------------------------
  let finalPhotoUrl = rawData.photoUrl || rawData.imageUrl || rawData.photo || rawData.photoDataUrl
  
  if (!finalPhotoUrl && rawData.photoDataUrls?.length > 0) finalPhotoUrl = rawData.photoDataUrls[0]
  if (!finalPhotoUrl && rawData.photos?.length > 0) finalPhotoUrl = rawData.photos[0]

  // If it's saved as a Convex Storage ID, we manually build the secure URL for your exact database
  const storageId = rawData.photoStorageId || rawData.storageId || (rawData.photoStorageIds && rawData.photoStorageIds[0])
  if (!finalPhotoUrl && storageId) {
    finalPhotoUrl = `https://pleasant-otter-637.convex.cloud/api/storage/${storageId}`
  }

  // ---------------------------------------------------------
  // 2. NAME & CONDITION FIX (Filtering out literal "undefined" strings)
  // ---------------------------------------------------------
  let fName = rawData.reporterFirstName || rawData.firstName || ''
  let lName = rawData.reporterLastName || rawData.lastName || ''
  if (fName === 'undefined') fName = ''
  if (lName === 'undefined') lName = ''
  
  let reporterName = `${fName} ${lName}`.trim()
  if (!reporterName || reporterName === 'undefined' || reporterName === 'undefined undefined') {
    reporterName = rawData.reporterName || rawData.userName || rawData.name || 'Anonymous Reporter'
  }

  let condition = rawData.animalCondition || rawData.condition || rawData.healthCondition || 'Not provided'
  if (condition === 'undefined' || condition === 'null') condition = 'Not provided'

  // ---------------------------------------------------------
  // 3. MAP LOCATION PARSER (Extracting Exact Lat/Lng)
  // ---------------------------------------------------------
  const locationString = rawData.location || 'Unknown location'
  let mapQuery = encodeURIComponent(locationString)

  // If the string contains the middle dot '·', slice it to only grab the coordinates at the end
  if (locationString.includes('·')) {
    const coords = locationString.split('·').pop()?.trim() // gets "9.751433, 118.766869"
    if (coords) mapQuery = encodeURIComponent(coords)
  } else if (rawData.latitude && rawData.longitude) {
    mapQuery = encodeURIComponent(`${rawData.latitude},${rawData.longitude}`)
  }
  
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`

  const canAct = rawData.status === 'pending'

  async function handleStatusChange(newStatus: 'published' | 'rejected') {
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
      toast.success(`Report ${newStatus === 'published' ? 'published to public feed' : 'rejected'}.`)
      setConfirmApprove(false)
      setConfirmReject(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update report status')
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
          <RescuerStatusBadge status={rawData.status as any} className="mb-4" />
          <p className="text-xs font-mono text-muted-foreground">
            {rawData.reportNumber ?? rawData._id}
          </p>
        </div>

        {/* IMAGE RENDERER */}
        {finalPhotoUrl ? (
          <div className="overflow-hidden rounded-2xl border border-border bg-muted/30">
            <img 
              src={finalPhotoUrl} 
              alt={rawData.animalName || 'Animal Photo'} 
              className="w-full object-contain max-h-[400px]"
            />
          </div>
        ) : null}

        <RescuerDetailSection title="Domestic Report Details" icon={CheckCircle2}>
          <dl className="space-y-3">
            <DetailRow label="Date & time seen" value={formatDateTime(rawData.seenAt ?? rawData._creationTime)} />
            <DetailRow label="Animal Type" value={rawData.type || rawData.animalType || 'Not specified'} />
            <DetailRow
              label="Condition"
              value={condition.replace(/-/g, ' ')}
              highlight
            />
            {rawData.description ? (
              <DetailRow label="Description" value={rawData.description} />
            ) : null}
          </dl>
        </RescuerDetailSection>

        {/* LOCATION & GOOGLE MAPS LINK */}
        <RescuerDetailSection title="Location" icon={MapPin}>
          <div className="space-y-2">
            <p className="font-medium leading-relaxed text-sm">{locationString}</p>
            <a 
              href={mapLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View on Google Maps
            </a>
          </div>
        </RescuerDetailSection>

        <RescuerDetailSection title="Reporter" icon={User}>
          <dl className="space-y-3">
            <DetailRow label="Name" value={reporterName} />
            <div>
              <dt className="text-xs text-muted-foreground">Contact</dt>
              <dd className="mt-1 font-medium">
                {rawData.reporterPhone || rawData.phone ? (
                  <a href={`tel:${(rawData.reporterPhone || rawData.phone).replace(/\s/g, '')}`} className="inline-flex items-center gap-2 text-primary hover:opacity-80">
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

      <ConfirmDialog
        open={confirmReject}
        onOpenChange={setConfirmReject}
        title="Reject Report?"
        description="This will decline the report and it will not be shown to the public."
        confirmLabel="Reject Report"
        loading={loading}
        onConfirm={() => handleStatusChange('rejected')}
      />
    </DomesticLayout>
  )
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={`mt-0.5 font-medium ${highlight ? 'text-primary' : 'text-foreground'} capitalize`}>
        {value}
      </dd>
    </div>
  )
}
