import { useState } from 'react'
import { useMutation } from 'convex/react'
import { Calendar, Loader2, MapPin, Pencil, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  WILDLIFE_CONDITIONS,
  formatReportType,
  isTerminalStatus,
  statusLabel,
  type StoredReport,
} from '@/lib/reports'
import { ReportPhotoField } from '@/components/report/ReportPhotoField'
import { ReportPhotosGallery } from '@/components/report/ReportPhotosGallery'
import { formatDateTime } from '@/lib/dates'
import {
  getReportPhotos,
  legacyPhotoDataUrlsForSubmit,
  photoStorageIdsForSubmit,
  reportPhotosFromStored,
  validateReportPhotosForSubmit,
  type ReportPhotoItem,
} from '@/lib/reportPhotos'
import { toast } from 'sonner'

type Props = {
  report: StoredReport | null
  userEmail: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReportDetailDialog({
  report,
  userEmail,
  open,
  onOpenChange,
}: Props) {
  const updateReport = useMutation(api.reports.update)
  const removeReport = useMutation(api.reports.remove)

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [photos, setPhotos] = useState<ReportPhotoItem[]>([])
  const [draft, setDraft] = useState({
    animalName: '',
    location: '',
    description: '',
    type: '',
    condition: '',
  })

  const dialogSyncKey = open && report ? report.id : null
  const [prevDialogSyncKey, setPrevDialogSyncKey] = useState<string | null>(null)
  if (dialogSyncKey !== prevDialogSyncKey) {
    setPrevDialogSyncKey(dialogSyncKey)
    if (report && dialogSyncKey) {
      setDraft({
        animalName: report.animalName,
        location: report.location,
        description: report.description ?? '',
        type: report.type,
        condition: report.condition ?? '',
      })
      setPhotos(reportPhotosFromStored(report))
      setEditing(false)
      setConfirmDelete(false)
    } else {
      setEditing(false)
      setConfirmDelete(false)
    }
  }

  if (!report) return null

  const rescueComplete = isTerminalStatus(report.status)

  const mapSrc =
    report.latitude != null && report.longitude != null
      ? `https://www.google.com/maps?q=${report.latitude},${report.longitude}&z=16&output=embed`
      : null

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!report) return
    if (rescueComplete) {
      toast.error('This report can no longer be edited after rescue is complete.')
      return
    }
    if (!draft.animalName.trim() || !draft.location.trim()) {
      toast.error('Animal name and location are required')
      return
    }
    const photoError = validateReportPhotosForSubmit(photos)
    if (photoError) {
      toast.error(photoError)
      return
    }

    const storageIds = photoStorageIdsForSubmit(photos)
    const legacyUrls = legacyPhotoDataUrlsForSubmit(photos)
    if (storageIds.length > 0 && legacyUrls.length > 0) {
      toast.error('Please re-upload existing photos before adding new ones.')
      return
    }

    setSaving(true)
    try {
      await updateReport({
        reportId: report.id as Id<'reports'>,
        userEmail,
        animalName: draft.animalName,
        location: draft.location,
        description: draft.description || undefined,
        type: draft.type,
        status: report.status,
        condition: report.category === 'wildlife' ? draft.condition || undefined : undefined,
        ...(storageIds.length > 0
          ? { photoStorageIds: storageIds }
          : { photoDataUrls: legacyUrls }),
      })
      toast.success('Report updated')
      setEditing(false)
      onOpenChange(false)
    } catch {
      toast.error('Could not save changes')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!report) return
    if (rescueComplete) {
      toast.error('This report can no longer be deleted after rescue is complete.')
      return
    }
    setSaving(true)
    try {
      await removeReport({
        reportId: report.id as Id<'reports'>,
        userEmail,
      })
      toast.success('Report deleted')
      onOpenChange(false)
    } catch {
      toast.error('Could not delete report')
    } finally {
      setSaving(false)
      setConfirmDelete(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        {(editing ? photos : getReportPhotos(report)).length > 0 ? (
          <div className="relative shrink-0 bg-muted">
            {editing ? (
              <>
                <img
                  src={photos[0]?.previewUrl}
                  alt=""
                  className="h-44 w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
              </>
            ) : (
              <ReportPhotosGallery
                photos={getReportPhotos(report)}
                alt={report.animalName}
                variant="hero"
              />
            )}
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6">
          <DialogHeader className="space-y-2 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="uppercase text-[10px] tracking-wider border-primary/20 text-primary">
                {formatReportType(report.type)}
              </Badge>
              <Badge variant="outline" className="text-[10px] capitalize">
                {report.category}
              </Badge>
              <span className="text-xs font-mono text-muted-foreground">
                {report.id.slice(-8).toUpperCase()}
              </span>
            </div>
            <DialogTitle
              className="text-xl"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {editing ? 'Edit report' : report.animalName}
            </DialogTitle>
            <DialogDescription className="text-left">
              {editing
                ? 'Update your submission details and save to the database.'
                : 'View the details of your submitted report.'}
            </DialogDescription>
          </DialogHeader>

          {editing ? (
            <form onSubmit={handleSave} className="mt-6 space-y-4">
              <Field label="Animal name">
                <Input
                  value={draft.animalName}
                  onChange={(e) =>
                    setDraft({ ...draft, animalName: e.target.value })
                  }
                  className="h-11 rounded-xl bg-background"
                  required
                />
              </Field>

              {report.category === 'domestic' && (
                <Field label="Report type">
                  <Select
                    value={draft.type}
                    onValueChange={(val) =>
                      setDraft({ ...draft, type: val ?? draft.type })
                    }
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOMESTIC_REPORT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}

              {report.category === 'wildlife' && (
                <Field label="Animal condition">
                  <Select
                    value={draft.condition || undefined}
                    onValueChange={(val) =>
                      setDraft({ ...draft, condition: val ?? '' })
                    }
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-background">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {WILDLIFE_CONDITIONS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}

              <Field label="Location">
                <Input
                  value={draft.location}
                  onChange={(e) =>
                    setDraft({ ...draft, location: e.target.value })
                  }
                  className="h-11 rounded-xl bg-background"
                  required
                />
              </Field>

              <Field label="Details">
                <Textarea
                  value={draft.description}
                  onChange={(e) =>
                    setDraft({ ...draft, description: e.target.value })
                  }
                  className="min-h-[100px] rounded-xl bg-background resize-none"
                />
              </Field>

              <Field label="Photos">
                <ReportPhotoField
                  value={photos}
                  onChange={setPhotos}
                  useStorageUpload={Boolean(report.photoStorageIds?.length)}
                />
              </Field>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    setPhotos(reportPhotosFromStored(report))
                    setEditing(false)
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl flex-1 sm:flex-none"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Save changes'
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="mt-6 space-y-5">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">{statusLabel(report.status)}</Badge>
                {report.reportNumber ? (
                  <span className="text-xs text-muted-foreground">{report.reportNumber}</span>
                ) : null}
              </div>

              {report.description && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
                    Details
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {report.description}
                  </p>
                </div>
              )}

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-foreground">Location</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {report.location}
                  </p>
                </div>
              </div>

              {mapSrc && (
                <div className="overflow-hidden rounded-xl border border-border">
                  <iframe
                    title="Report location"
                    src={mapSrc}
                    width="100%"
                    height={180}
                    className="w-full bg-muted"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {formatDateTime(report.createdAt)}
              </div>

              {rescueComplete ? (
                <p className="border-t border-border pt-5 text-sm text-muted-foreground">
                  This report is closed. It can no longer be edited or deleted after rescue is
                  complete.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 border-t border-border pt-5">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setEditing(true)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    className="rounded-xl"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete report?"
        description="This will permanently delete your report. This action cannot be undone."
        confirmLabel="Delete"
        loading={saving}
        onConfirm={handleDelete}
      />
    </Dialog>
  )
}


function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  )
}
