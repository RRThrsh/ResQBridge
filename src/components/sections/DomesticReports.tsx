import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'convex/react'
import {
  ArrowRight,
  MapPin,
  Clock,
  Loader2,
  PawPrint,
  AlertCircle,
  X,
  ChevronRight,
} from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import { Card, CardContent } from '@/components/ui/card'
import { RevealOnScroll } from '@/components/RevealOnScroll'
import { formatDateTime } from '@/lib/dates'
import {
  reportTypeLabels,
  reportTypeOverlayBase,
  reportTypeOverlayColors,
  type PublicDomesticReport,
} from '@/lib/domesticPublic'
import { getReportPhotos } from '@/lib/reportPhotos'
import { DomesticReportDetailDialog } from '@/components/report/DomesticReportDetailDialog'
import { useLanguage } from '@/context/LanguageContext'

function ReportCard({ report, onClick }: { report: PublicDomesticReport; onClick: () => void }) {
  const photos = getReportPhotos({ photoDataUrls: report.images, photoDataUrl: report.image })
  const cover = photos[0]

  return (
    <Card
      onClick={onClick}
      className="card-shimmer overflow-hidden border-border bg-card hover:border-primary/30 transition-colors duration-300 cursor-pointer"
    >
      <div className="relative h-44 overflow-hidden bg-muted">
        {cover ? (
          <img
            src={cover}
            alt={report.animalName}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <PawPrint className="h-10 w-10 opacity-40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-3 left-3 z-10">
          <span className={`${reportTypeOverlayBase} ${reportTypeOverlayColors[report.type]}`}>
            {reportTypeLabels[report.type]}
          </span>
        </div>
        <p
          className="absolute bottom-3 left-3 text-sm font-bold text-white"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {report.animalName}
          {report.species ? (
            <span className="ml-1.5 font-normal text-white/70 text-xs">· {report.species}</span>
          ) : null}
        </p>
      </div>
      <CardContent className="p-4 space-y-2">
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {report.description}
        </p>
        <div className="flex items-center gap-3 pt-1">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3 text-primary/60" />
            {report.location.split(',')[0]}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground ml-auto">
            <Clock className="h-3 w-3 text-primary/60" />
            {formatDateTime(report.createdAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function ViewAllModal({ reports, type, open, onClose, onReportClick }: {
  reports: PublicDomesticReport[]
  type: string
  open: boolean
  onClose: () => void
  onReportClick: (report: PublicDomesticReport) => void
}) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, handleKeyDown])

  if (!open) return null

  const heading = type === 'missing' ? 'Missing Reports' : type === 'found' ? 'Found Reports' : 'Approved Reports'

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 pt-8 pb-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl rounded-2xl bg-popover p-6 shadow-lg ring-1 ring-foreground/10 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              {heading}
            </h2>
            <p className="text-xs text-muted-foreground">{reports.length} report{reports.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} onClick={() => onReportClick(report)} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function DomesticReports() {
  const { t } = useLanguage()
  const [selectedReport, setSelectedReport] = useState<PublicDomesticReport | null>(null)
  const [viewAllType, setViewAllType] = useState<'missing' | 'found' | null>(null)
  const [timedOut, setTimedOut] = useState(false)
  const timedOutRef = useRef(false)

  const reports = useQuery(api.reports.listPublicDomestic)

  useEffect(() => {
    if (reports !== undefined) return
    const timer = setTimeout(() => {
      if (!timedOutRef.current) {
        timedOutRef.current = true
        setTimedOut(true)
      }
    }, 15_000)
    return () => clearTimeout(timer)
  }, [reports])

  const missing = useMemo(
    () => (reports ?? []).filter((r) => r.type === 'missing'),
    [reports],
  )
  const found = useMemo(
    () => (reports ?? []).filter((r) => r.type === 'found'),
    [reports],
  )

  return (
    <section id="domestic" className="py-24">
      <RevealOnScroll>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-primary">{t('domesticSection.eyebrow')}</p>
            <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              {t('domesticSection.title')}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('domesticSection.desc')}
            </p>
          </div>
          <Link to="/report"
            className="group mt-4 sm:mt-0 inline-flex items-center gap-1 text-xs font-medium text-primary hover:opacity-80 transition-opacity shrink-0">
            {t('domesticSection.submitLink')}
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {reports === undefined && !timedOut ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : timedOut ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
            <AlertCircle className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">{t('domesticSection.errorTitle')}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('domesticSection.errorDesc')}
            </p>
          </div>
        ) : missing.length === 0 && found.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
            <PawPrint className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">{t('domesticSection.emptyTitle')}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('domesticSection.emptyDesc')}
            </p>
          </div>
        ) : (
          <>
            {missing.length > 0 && (
              <div className="mb-10">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                    Missing
                  </h3>
                  {missing.length > 4 && (
                    <button
                      type="button"
                      onClick={() => setViewAllType('missing')}
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:opacity-80 transition-opacity"
                    >
                      View More
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {missing.slice(0, 4).map((r) => (
                    <ReportCard key={r.id} report={r} onClick={() => setSelectedReport(r)} />
                  ))}
                </div>
              </div>
            )}

            {found.length > 0 && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                    Found
                  </h3>
                  {found.length > 4 && (
                    <button
                      type="button"
                      onClick={() => setViewAllType('found')}
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:opacity-80 transition-opacity"
                    >
                      View More
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {found.slice(0, 4).map((r) => (
                    <ReportCard key={r.id} report={r} onClick={() => setSelectedReport(r)} />
                  ))}
                </div>
              </div>
            )}

            <ViewAllModal
              reports={viewAllType === 'missing' ? missing : viewAllType === 'found' ? found : []}
              type={viewAllType ?? 'missing'}
              open={viewAllType !== null}
              onClose={() => setViewAllType(null)}
              onReportClick={(r) => { setSelectedReport(r); setViewAllType(null) }}
            />
          </>
        )}

        <DomesticReportDetailDialog
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      </div>
      </RevealOnScroll>
    </section>
  )
}
