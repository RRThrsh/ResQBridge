import { MapPin, Clock, Phone, AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ReportPhotosGallery } from '@/components/report/ReportPhotosGallery'
import { formatDateWithWeekday } from '@/lib/dates'
import {
  publicStatusLabels,
  reportTypeColors,
  reportTypeLabels,
  reportTypeOverlayBase,
  reportTypeOverlayColors,
  type PublicDomesticReport,
} from '@/lib/domesticPublic'
import { useLanguage } from '@/context/LanguageContext'
import { getReportPhotos } from '@/lib/reportPhotos'

interface DomesticReportDetailDialogProps {
  report: PublicDomesticReport | null
  onClose: () => void
}

export function DomesticReportDetailDialog({
  report,
  onClose,
}: DomesticReportDetailDialogProps) {
  const { t } = useLanguage()
  if (!report) return null

  const photos = getReportPhotos({ photoDataUrls: report.images, photoDataUrl: report.image })
  const phoneHref = report.contactNumber?.replace(/\s/g, '')

  return (
    <Dialog open={!!report} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[min(90vh,720px)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        {photos.length > 0 ? (
          <div className="relative shrink-0">
            <ReportPhotosGallery photos={photos} alt={report.animalName} variant="hero" />
            <div className="absolute top-4 left-4 z-10">
              <span
                className={cn(
                  reportTypeOverlayBase,
                  reportTypeOverlayColors[report.type],
                  'px-2.5 py-1',
                )}
              >
                {reportTypeLabels[report.type]}
              </span>
            </div>
          </div>
        ) : (
          <div className="relative h-40 shrink-0 bg-muted px-6 pt-6">
            <Badge
              className={`${reportTypeColors[report.type]} border-0 font-medium px-2.5 py-1`}
            >
              {reportTypeLabels[report.type]}
            </Badge>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <DialogTitle
              className="text-2xl font-black text-foreground leading-none mb-1"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {report.animalName}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {report.species}
            </DialogDescription>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-widest mb-2">
              {t('domesticDetail.description')}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {report.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                {t('domesticDetail.color')}
              </p>
              <p className="text-sm text-foreground font-medium">
                {report.color || t('domesticDetail.notSpecified')}
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                {t('domesticDetail.status')}
              </p>
              <p className="text-sm text-foreground font-medium capitalize">
                {publicStatusLabels[report.status]}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{t('domesticDetail.location')}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
                  {report.location}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{t('domesticDetail.dateReported')}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {formatDateWithWeekday(report.createdAt)}
                </p>
              </div>
            </div>

            {report.contactNumber ? (
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{t('domesticDetail.contactNumber')}</p>
                  <p className="text-sm text-foreground mt-0.5 font-medium">
                    {report.contactNumber}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <Separator />

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-500 mb-1">
                {t('domesticDetail.helpTitle')}
              </p>
              <p className="text-xs text-amber-500/80 leading-relaxed">
                {t('domesticDetail.helpText')}
              </p>
            </div>
          </div>

          {phoneHref ? (
            <a
              href={`tel:${phoneHref}`}
              className={cn(
                buttonVariants({ variant: 'default', size: 'lg' }),
                'h-12 w-full rounded-xl font-bold shadow-none',
              )}
            >
              <Phone className="mr-2 h-4 w-4" />
              {t('domesticDetail.callReporter')}
            </a>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
