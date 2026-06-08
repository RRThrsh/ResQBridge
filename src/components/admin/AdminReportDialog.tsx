import { useState, useEffect } from 'react'
import { useMutation } from 'convex/react'
import { Loader2, MapPin, Search, User, Phone, Bird, PawPrint } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { AdminAssignRescuerPanel } from '@/components/admin/AdminAssignRescuerPanel'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DOMESTIC_REPORT_TYPES,
  WILDLIFE_BEHAVIORS,
  WILDLIFE_CONDITIONS,
  canAdminAssignRescuer,
  formatReporterName,
  formatReportType,
  statusLabel,
  type AdminStoredReport,
} from '@/lib/reports'
import { formatDateTime } from '@/lib/dates'
import { normalizeEmail } from '@/lib/admin'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type DialogMode = 'view' | 'edit'

type Props = {
  report: AdminStoredReport | null
  adminEmail: string
  mode: DialogMode
  readOnly?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminReportDialog({
  report,
  adminEmail,
  mode,
  readOnly = false,
  open,
  onOpenChange,
}: Props) {
  const updateReport = useMutation(api.admin.updateReport)

  const [saving, setSaving] = useState(false)
  const [assignRescuerEmail, setAssignRescuerEmail] = useState('')
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [mainPhotoIdx, setMainPhotoIdx] = useState(0)

  // Reset gallery view when report changes
  useEffect(() => {
    setMainPhotoIdx(0)
  }, [report?.id])

  if (!open && previewImage) {
    setPreviewImage(null)
  }

  const [draft, setDraft] = useState({
    animalName: '',
    location: '',
    description: '',
    type: '',
    condition: '',
    behavior: '',
    reporterPhone: '',
    quantity: '',
    reportedSize: '',
  })

  const isView = readOnly || mode === 'view'

  const assignSyncKey = open && report ? `${report.id}:${report.assignedRescuerEmail ?? ''}` : null
  const [prevAssignSyncKey, setPrevAssignSyncKey] = useState<string | null>(null)
  if (assignSyncKey !== prevAssignSyncKey) {
    setPrevAssignSyncKey(assignSyncKey)
    if (assignSyncKey && report) {
      setAssignRescuerEmail(report.assignedRescuerEmail ?? '')
    }
  }

  const draftSyncKey = open && !isView && report ? report.id : null
  const [prevDraftSyncKey, setPrevDraftSyncKey] = useState<string | null>(null)
  if (draftSyncKey !== prevDraftSyncKey && report) {
    setPrevDraftSyncKey(draftSyncKey)
    if (draftSyncKey) {
      setDraft({
        animalName: report.animalName,
        location: report.location,
        description: report.description ?? '',
        type: report.type,
        condition: report.condition ?? '',
        behavior: report.behavior ?? '',
        reporterPhone: report.reporterPhone ?? '',
        quantity: report.quantity != null ? String(report.quantity) : '',
        reportedSize: report.reportedSize ?? '',
      })
    }
  }

  if (!report) return null

  const activeReport = report
  const showAssign = !readOnly && canAdminAssignRescuer(activeReport.status)

  async function handleSave() {
    setSaving(true)
    try {
      await updateReport({
        adminEmail: normalizeEmail(adminEmail),
        reportId: activeReport.id as Id<'reports'>,
        animalName: draft.animalName,
        location: draft.location,
        description: draft.description || undefined,
        type: draft.type,
        condition: draft.condition || undefined,
        behavior: draft.behavior || undefined,
        reporterPhone: draft.reporterPhone || undefined,
        quantity: draft.quantity ? Number(draft.quantity) : undefined,
        reportedSize: draft.reportedSize || undefined,
        seenAt: activeReport.seenAt,
      })
      toast.success('Report updated')
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update report')
    } finally {
      setSaving(false)
    }
  }

  const CategoryIcon = activeReport.category === 'domestic' ? PawPrint : Bird

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* FULLSCREEN IMAGE PREVIEW */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-background/95 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -right-2 -top-12 z-[999999] flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-2xl font-bold text-foreground shadow-lg border border-border/20 transition hover:bg-background sm:-right-12 sm:-top-4"
            >
              ×
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}

      <DialogContent
        className="
          flex w-[95vw] max-w-2xl max-h-[92vh] flex-col overflow-hidden
          rounded-2xl border border-border/20 bg-background p-0 text-foreground
          shadow-2xl sm:w-full
        "
      >
        <DialogHeader className="shrink-0 border-b border-border/10 bg-background/80 px-6 py-5 backdrop-blur-md">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            PWRCC Report
          </p>
          <DialogTitle className="text-xl font-medium tracking-tight">
            {activeReport.reportNumber ?? activeReport.id}
          </DialogTitle>
          {!isView && (
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Editing report details
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-8 sm:px-8">
          
          {/* TOP STATUS BADGE */}
          {isView && (
            <div className="mb-10 flex flex-col items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                {statusLabel(activeReport.status)}
              </span>
              <p className="text-xs text-muted-foreground font-mono">
                {activeReport.reportNumber ?? activeReport.id}
              </p>
            </div>
          )}

          {/* EDIT MODE TOGGLES */}
          {!isView && (
            <div className="mb-8 flex flex-wrap gap-2">
              <Badge variant="outline" className="capitalize bg-background/50 border-border/20">
                {activeReport.category}
              </Badge>
              <Badge variant="outline" className="bg-background/50 border-border/20">
                {formatReportType(activeReport.type)}
              </Badge>
            </div>
          )}

          {/* ASSIGNMENT PANEL */}
          {showAssign ? (
            <div className="mb-8">
              <AdminAssignRescuerPanel
                report={activeReport}
                adminEmail={adminEmail}
                rescuerEmail={assignRescuerEmail}
                onRescuerEmailChange={setAssignRescuerEmail}
                onAssigned={() => onOpenChange(false)}
              />
            </div>
          ) : activeReport.assignedRescuerName ? (
            <div className="mb-8 rounded-xl border border-border/10 bg-muted/40 p-4 text-sm">
              <span className="text-muted-foreground">Assigned to: </span>
              <span className="font-medium text-foreground">{activeReport.assignedRescuerName}</span>
            </div>
          ) : null}

          {/* IMAGE GALLERY */}
          {activeReport.photoDataUrls.length > 0 ? (
            <div className="mb-10 flex flex-col items-center">
              <div 
                className="relative flex w-full max-w-lg cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-muted/40 aspect-[4/3] group"
                onClick={() => setPreviewImage(activeReport.photoDataUrls[mainPhotoIdx])}
              >
                <span className="absolute right-3 top-3 z-10 rounded-full bg-black/80 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                  {activeReport.photoDataUrls.length} photo{activeReport.photoDataUrls.length !== 1 && 's'}
                </span>
                <img
                  src={activeReport.photoDataUrls[mainPhotoIdx]}
                  alt={`${activeReport.animalName} main view`}
                  className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {activeReport.photoDataUrls.length > 1 && (
                <div className="mt-4 flex max-w-lg w-full gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {activeReport.photoDataUrls.map((photo, index) => (
                    <button
                      key={`${index}-${photo.slice(0, 16)}`}
                      onClick={() => setMainPhotoIdx(index)}
                      className={cn(
                        "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200",
                        mainPhotoIdx === index 
                          ? "border-primary opacity-100 ring-2 ring-primary/20 ring-offset-2 ring-offset-background" 
                          : "border-transparent opacity-40 hover:opacity-100"
                      )}
                    >
                      <img src={photo} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Search className="h-3.5 w-3.5" /> 
                Tap to expand {activeReport.photoDataUrls.length > 1 && '· swipe between photos'}
              </p>
            </div>
          ) : null}

          {/* DETAILS VIEW OR EDIT FORM */}
          {isView ? (
            <div className="space-y-8">
              
              {/* WILDLIFE / DOMESTIC DETAILS */}
{/* WILDLIFE / DOMESTIC DETAILS */}
<section>
  <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
    <CategoryIcon className="h-3.5 w-3.5" />
    <span>
      {activeReport.category === 'domestic'
        ? 'Domestic Details'
        : 'Wildlife Details'}
    </span>
  </div>

  <div className="rounded-2xl border border-border/10 bg-muted/30 p-5 space-y-5">

    {/* =========================
        WILDLIFE REPORT
    ========================= */}
    {activeReport.category === 'wildlife' ? (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <div className="mb-1 text-xs text-muted-foreground">
            Species
          </div>
          <div className="font-serif text-lg font-medium tracking-wide text-foreground">
            {activeReport.animalName || 'N/A'}
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs text-muted-foreground">
            Date & time seen
          </div>
          <div className="font-medium text-foreground">
            {formatDateTime(
              activeReport.seenAt ?? activeReport.createdAt,
            )}
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs text-muted-foreground">
            Quantity
          </div>
          <div className="font-medium text-foreground">
            {activeReport.quantity ?? 1}
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs text-muted-foreground">
            Wildlife Condition
          </div>
          <div className="font-medium capitalize text-foreground">
            {activeReport.condition || 'N/A'}
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs text-muted-foreground">
            Behavior
          </div>
          <div className="font-medium text-primary bg-primary/10 inline-flex px-2 py-0.5 rounded text-sm">
            {activeReport.behavior || 'N/A'}
          </div>
        </div>

        {/* ADDED REPORTED SIZE HERE */}
        <div>
          <div className="mb-1 text-xs text-muted-foreground">
            Reported Size
          </div>
          <div className="font-medium capitalize text-foreground">
            {activeReport.reportedSize || 'N/A'}
          </div>
        </div>

        {activeReport.description && (
          <div className="sm:col-span-2 pt-2 border-t border-border/10">
            <div className="mb-1 text-xs text-muted-foreground">
              Additional Details
            </div>
            <div className="text-sm whitespace-pre-wrap leading-relaxed text-foreground">
              {activeReport.description}
            </div>
          </div>
        )}
      </div>
    ) : activeReport.type === 'injured' ? (

      /* =========================
          DOMESTIC INJURED
      ========================= */
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

        <div>
          <div className="mb-1 text-xs text-muted-foreground">
            Species
          </div>

          <div className="font-medium text-foreground">
            {activeReport.speciesId || 'N/A'}
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs text-muted-foreground">
            Animal Name
          </div>

          <div className="font-medium text-foreground">
            {activeReport.animalName || 'N/A'}
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs text-muted-foreground">
            Nature of Injury
          </div>

          <div className="font-medium text-foreground">
            {activeReport.condition || 'N/A'}
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs text-muted-foreground">
            Severity
          </div>

          <div className="font-medium capitalize text-foreground">
            {activeReport.behavior || 'N/A'}
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs text-muted-foreground">
            Current Condition
          </div>

          <div className="font-medium capitalize text-foreground">
            {activeReport.reportedSize || 'N/A'}
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs text-muted-foreground">
            Rescue Priority
          </div>

          <div className="font-medium capitalize text-foreground">
            {activeReport.color || 'N/A'}
          </div>
        </div>

        {activeReport.description && (
          <div className="sm:col-span-2 pt-2 border-t border-border/10">
            <div className="mb-1 text-xs text-muted-foreground">
              Additional Information
            </div>

            <div className="text-sm whitespace-pre-wrap leading-relaxed text-foreground">
              {activeReport.description}
            </div>
          </div>
        )}
      </div>
    ) : (

      /* =========================
          DOMESTIC MISSING/FOUND/STRAY
      ========================= */
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

        <div>
          <div className="mb-1 text-xs text-muted-foreground">
            Species
          </div>

          <div className="font-medium text-foreground">
            {activeReport.speciesId || 'N/A'}
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs text-muted-foreground">
            Pet Name
          </div>

          <div className="font-medium text-foreground">
            {activeReport.animalName || 'N/A'}
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs text-muted-foreground">
            Report Type
          </div>

          <div className="font-medium capitalize text-foreground">
            {formatReportType(activeReport.type)}
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs text-muted-foreground">
            Color / Markings
          </div>

          <div className="font-medium text-foreground">
            {activeReport.color || 'N/A'}
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs text-muted-foreground">
            Reported Size
          </div>

          <div className="font-medium capitalize text-foreground">
            {activeReport.reportedSize || 'N/A'}
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs text-muted-foreground">
            Quantity
          </div>

          <div className="font-medium text-foreground">
            {activeReport.quantity ?? 1}
          </div>
        </div>

        {activeReport.description && (
          <div className="sm:col-span-2 pt-2 border-t border-border/10">
            <div className="mb-1 text-xs text-muted-foreground">
              Additional Details
            </div>

            <div className="text-sm whitespace-pre-wrap leading-relaxed text-foreground">
              {activeReport.description}
            </div>
          </div>
        )}
      </div>
    )}
  </div>
</section>

              {/* LOCATION */}
              <section>
                <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Location</span>
                </div>
                <div className="rounded-2xl border border-border/10 bg-muted/30 p-5">
                  <div className="mb-2 text-xs text-muted-foreground">Address / Landmark</div>
                  <div className="text-sm font-medium leading-relaxed text-foreground">
                    {activeReport.location}
                  </div>
                </div>
              </section>

              {/* REPORTER */}
              <section>
                <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  <User className="h-3.5 w-3.5" />
                  <span>Reporter</span>
                </div>
                <div className="rounded-2xl border border-border/10 bg-muted/30 p-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <div className="mb-1 text-xs text-muted-foreground">Name</div>
                      <div className="font-medium text-foreground">
                        {formatReporterName(activeReport.reporterFirstName, activeReport.reporterLastName)}
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 text-xs text-muted-foreground">Contact</div>
                      <div className="inline-flex items-center gap-2 font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                        {activeReport.reporterPhone ?? 'N/A'}
                        {activeReport.reporterPhone && <Phone className="h-3 w-3" />}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          ) : (
            // EDIT FORM
            <div className="grid gap-5 rounded-2xl border border-border/10 bg-muted/30 p-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Animal name</label>
                <Input
                  className="border-border/20 bg-background/50 text-foreground transition focus-visible:border-primary"
                  value={draft.animalName}
                  onChange={(e) => setDraft((d) => ({ ...d, animalName: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Location</label>
                <Input
                  className="border-border/20 bg-background/50 text-foreground transition focus-visible:border-primary"
                  value={draft.location}
                  onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Description</label>
                <Textarea
                  className="border-border/20 bg-background/50 text-foreground transition focus-visible:border-primary resize-none"
                  value={draft.description}
                  onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                  rows={4}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Reporter phone</label>
                <Input
                  className="border-border/20 bg-background/50 text-foreground transition focus-visible:border-primary"
                  value={draft.reporterPhone}
                  onChange={(e) => setDraft((d) => ({ ...d, reporterPhone: e.target.value }))}
                />
              </div>

              {activeReport.category === 'domestic' ? (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Report type</label>
                  <Select
                    value={draft.type}
                    onValueChange={(value) => value && setDraft((d) => ({ ...d, type: value }))}
                  >
                    <SelectTrigger className="border-border/20 bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-border/20 bg-background">
                      {DOMESTIC_REPORT_TYPES.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                // CHANGED TO grid-cols-3 to fit the new size input nicely
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Behavior</label>
                    <Select
                      value={draft.behavior || ''}
                      onValueChange={(value) => value && setDraft((d) => ({ ...d, behavior: value }))}
                    >
                      <SelectTrigger className="border-border/20 bg-background/50">
                        <SelectValue placeholder="Select behavior" />
                      </SelectTrigger>
                      <SelectContent className="border-border/20 bg-background">
                        {WILDLIFE_BEHAVIORS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Condition</label>
                    <Select
                      value={draft.condition || ''}
                      onValueChange={(value) => value && setDraft((d) => ({ ...d, condition: value }))}
                    >
                      <SelectTrigger className="border-border/20 bg-background/50">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent className="border-border/20 bg-background">
                        {WILDLIFE_CONDITIONS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* ADDED REPORTED SIZE EDIT FIELD */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Reported Size</label>
                    <Input
                      className="border-border/20 bg-background/50 text-foreground transition focus-visible:border-primary"
                      value={draft.reportedSize}
                      onChange={(e) => setDraft((d) => ({ ...d, reportedSize: e.target.value }))}
                      placeholder="e.g. Small, 2ft"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 border-t border-border/10 bg-background/90 px-6 py-4 backdrop-blur-md sm:justify-end">
          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
            <Button 
              type="button" 
              variant="outline" 
              className="border-border/20 hover:bg-muted"
              onClick={() => onOpenChange(false)}
            >
              {isView ? 'Close' : 'Cancel'}
            </Button>
            {!isView && (
              <Button type="button" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {saving ? 'Saving...' : 'Save changes'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
