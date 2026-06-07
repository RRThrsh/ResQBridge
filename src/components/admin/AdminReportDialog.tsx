import { useState } from 'react'
import { useMutation } from 'convex/react'
import { Calendar, Loader2, MapPin } from 'lucide-react'
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {previewImage && (
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-background/90 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          {/* IMAGE WRAPPER */}
          <div
            className="relative flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE BUTTON */}
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-4 -right-4 z-[999999] flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border/80 text-foreground shadow-lg transition-colors hover:bg-muted hover:text-foreground"
            >
              ×
            </button>

            {/* IMAGE */}
            <img
              src={previewImage}
              alt="Preview"
              className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}

      <DialogContent
        className={cn(
          'w-[95vw] max-w-5xl max-h-[92vh] flex flex-col overflow-hidden',
          'rounded-2xl border border-border/80 bg-background text-foreground shadow-2xl sm:p-0',
          'p-0' // Removing default padding to use custom header/body/footer structure
        )}
      >
        {/* Subtle background element matched to layout */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,var(--color-primary)/0.08,transparent)]" />

        <DialogHeader className="shrink-0 border-b border-border/80 bg-background/80 px-6 py-4 backdrop-blur-md">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            PWRCC Admin
          </p>
          <DialogTitle
            className="truncate text-xl font-bold sm:text-2xl"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {isView ? 'View report' : 'Edit report'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {activeReport.reportNumber ?? activeReport.id} · {activeReport.animalName} ·{' '}
            {formatReporterName(activeReport.reporterFirstName, activeReport.reporterLastName)}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 overscroll-y-contain">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="capitalize bg-background/50 backdrop-blur-sm">
                {activeReport.category}
              </Badge>
              <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                {formatReportType(activeReport.type)}
              </Badge>
              <Badge variant="default">{statusLabel(activeReport.status)}</Badge>
            </div>

            {activeReport.assignedRescuerName ? (
              <p className="text-sm text-muted-foreground">
                Assigned to:{' '}
                <span className="font-medium text-foreground">{activeReport.assignedRescuerName}</span>
              </p>
            ) : showAssign ? (
              <p className="text-sm text-amber-600 dark:text-amber-400">No rescuer assigned yet.</p>
            ) : null}

            {showAssign ? (
              <AdminAssignRescuerPanel
                report={activeReport}
                adminEmail={adminEmail}
                rescuerEmail={assignRescuerEmail}
                onRescuerEmailChange={setAssignRescuerEmail}
                onAssigned={() => onOpenChange(false)}
              />
            ) : null}

            {activeReport.photoDataUrls.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeReport.photoDataUrls.map((photo, index) => (
                    <img
                      key={`${index}-${photo.slice(0, 16)}`}
                      src={photo}
                      alt={`${activeReport.animalName} ${index + 1}`}
                      onClick={() => setPreviewImage(photo)}
                      className="w-full max-h-[320px] rounded-xl border border-border/80 object-cover bg-muted/50 cursor-pointer transition-opacity hover:opacity-80 sm:max-h-[420px]"
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {isView ? (
              <dl className="grid gap-6 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-border/80 bg-muted/20 p-4">
                  <div>
                    <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">Species</dt>
                    <dd className="font-medium text-foreground mt-0.5">{activeReport.speciesId ?? 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">Report Type</dt>
                    <dd className="capitalize text-foreground mt-0.5">{activeReport.type}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">Reporter</dt>
                    <dd className="font-medium text-foreground mt-0.5">
                      {formatReporterName(activeReport.reporterFirstName, activeReport.reporterLastName)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">Contact</dt>
                    <dd className="text-foreground mt-0.5">{activeReport.reporterPhone ?? 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">Quantity</dt>
                    <dd className="text-foreground mt-0.5">{activeReport.quantity ?? 1}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">Size / Condition</dt>
                    <dd className="capitalize text-foreground mt-0.5">{activeReport.reportedSize ?? 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">Color / Markings</dt>
                    <dd className="text-foreground mt-0.5">{activeReport.color ?? 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">Behavior / Severity</dt>
                    <dd className="capitalize text-foreground mt-0.5">{activeReport.behavior ?? 'N/A'}</dd>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 rounded-lg border border-border/80 bg-background/50 p-3 backdrop-blur-sm">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground">Location</dt>
                      <dd className="mt-1">{activeReport.location}</dd>
                    </div>
                  </div>

                  {activeReport.condition ? (
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground">Injuries / Condition</dt>
                      <dd className="mt-1 whitespace-pre-wrap rounded-lg bg-muted/30 p-3">
                        {activeReport.condition}
                      </dd>
                    </div>
                  ) : null}

                  {activeReport.description ? (
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground">Description</dt>
                      <dd className="mt-1 whitespace-pre-wrap rounded-lg bg-muted/30 p-3 text-muted-foreground">
                        {activeReport.description}
                      </dd>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <dd className="text-sm">{formatDateTime(activeReport.seenAt ?? activeReport.createdAt)}</dd>
                  </div>
                </div>
              </dl>
            ) : (
              <div className="grid gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Animal name</label>
                  <Input
                    className="border-border/80 bg-background transition-colors hover:border-border focus-visible:border-primary"
                    value={draft.animalName}
                    onChange={(e) => setDraft((d) => ({ ...d, animalName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Location</label>
                  <Input
                    className="border-border/80 bg-background transition-colors hover:border-border focus-visible:border-primary"
                    value={draft.location}
                    onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Description</label>
                  <Textarea
                    className="border-border/80 bg-background transition-colors hover:border-border focus-visible:border-primary"
                    value={draft.description}
                    onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                    rows={4}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Reporter phone</label>
                  <Input
                    className="border-border/80 bg-background transition-colors hover:border-border focus-visible:border-primary"
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
                      <SelectTrigger className="border-border/80 bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-border bg-background">
                        {DOMESTIC_REPORT_TYPES.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Behavior</label>
                      <Select
                        value={draft.behavior || ''}
                        onValueChange={(value) => value && setDraft((d) => ({ ...d, behavior: value }))}
                      >
                        <SelectTrigger className="border-border/80 bg-background">
                          <SelectValue placeholder="Select behavior" />
                        </SelectTrigger>
                        <SelectContent className="border-border bg-background">
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
                        <SelectTrigger className="border-border/80 bg-background">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent className="border-border bg-background">
                          {WILDLIFE_CONDITIONS.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t border-border/80 bg-background/90 px-6 py-4 backdrop-blur-md sm:justify-end">
          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {isView ? 'Close' : 'Cancel'}
            </Button>
            {!isView ? (
              <Button type="button" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {saving ? 'Saving...' : 'Save changes'}
              </Button>
            ) : null}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
