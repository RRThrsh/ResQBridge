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
import { useLanguage } from '@/context/LanguageContext'
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
  const { t } = useLanguage()
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
      toast.error(t('reportDetail.errorRescueComplete'))
      return
    }
    if (!draft.animalName.trim() || !draft.location.trim()) {
      toast.error(t('reportDetail.errorRequiredFields'))
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
      toast.error(t('reportDetail.errorReupload'))
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
      toast.success(t('reportDetail.successUpdated'))
      setEditing(false)
      onOpenChange(false)
    } catch {
      toast.error(t('reportDetail.errorUpdate'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!report) return
    if (rescueComplete) {
      toast.error(t('reportDetail.errorDeleteComplete'))
      return
    }
    setSaving(true)
    try {
      await removeReport({
        reportId: report.id as Id<'reports'>,
        userEmail,
      })
      toast.success(t('reportDetail.successDeleted'))
      onOpenChange(false)
    } catch {
      toast.error(t('reportDetail.errorDelete'))
    } finally {
      setSaving(false)
      setConfirmDelete(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-lg">
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

        <div className="flex flex-col p-6">
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
              {editing ? t('reportDetail.editTitle') : report.animalName}
            </DialogTitle>
            <DialogDescription className="text-left">
              {editing ? t('reportDetail.editDesc') : t('reportDetail.viewDesc')}
            </DialogDescription>
          </DialogHeader>

          {editing ? (
            <form onSubmit={handleSave} className="mt-6 space-y-4">
              <Field label={t('reportDetail.fieldAnimalName')}>
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
                <Field label={t('reportDetail.fieldType')}>
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
                <Field label={t('reportDetail.fieldCondition')}>
                  <Select
                    value={draft.condition || undefined}
                    onValueChange={(val) =>
                      setDraft({ ...draft, condition: val ?? '' })
                    }
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-background">
                      <SelectValue placeholder={t('reportDetail.conditionPlaceholder')} />
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

              <Field label={t('reportDetail.fieldLocation')}>
                <Input
                  value={draft.location}
                  onChange={(e) =>
                    setDraft({ ...draft, location: e.target.value })
                  }
                  className="h-11 rounded-xl bg-background"
                  required
                />
              </Field>

              <Field label={t('reportDetail.fieldDetails')}>
                <Textarea
                  value={draft.description}
                  onChange={(e) =>
                    setDraft({ ...draft, description: e.target.value })
                  }
                  className="min-h-[100px] rounded-xl bg-background resize-none"
                />
              </Field>

              <Field label={t('reportDetail.fieldPhotos')}>
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
                  {t('reportDetail.cancel')}
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl flex-1 sm:flex-none"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t('reportDetail.saveChanges')
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
                    {t('reportDetail.viewDetails')}
                   
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {report.description}
                  </p>
                </div>
              )}

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-foreground">{t('reportDetail.viewLocation')}</p>
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
                  {t('reportDetail.closedMessage')}
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
                    {t('reportDetail.edit')}
                   
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    className="rounded-xl"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('reportDetail.delete')}
                   
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
        title={t('reportDetail.confirmTitle')}
        description={t('reportDetail.confirmDesc')}
        confirmLabel={t('reportDetail.confirmLabel')}
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
