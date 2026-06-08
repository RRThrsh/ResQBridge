import { useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { ChevronRight, Loader2, PawPrint, Search, X } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import { useDomesticAuth } from '@/context/DomesticAuthContext'
import { formatDate } from '@/lib/dates'
import { cn } from '@/lib/utils'
import { DomesticReportDetailDialog } from '@/components/report/DomesticReportDetailDialog'
import type { PublicDomesticReport } from '@/lib/domesticPublic'
import {
  reportTypeLabels,
  reportTypeOverlayBase,
  reportTypeOverlayColors,
} from '@/lib/domesticPublic'
import { getReportPhotos } from '@/lib/reportPhotos'

function ReportCard({ report, onClick }: { report: PublicDomesticReport; onClick: () => void }) {
  const photos = getReportPhotos({ photoDataUrls: report.images, photoDataUrl: report.image })
  const photo = photos[0]
  const extra = photos.length > 1 ? photos.length - 1 : 0

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-all hover:border-primary/30 hover:shadow-sm"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {photo ? (
          <>
            <img
              src={photo}
              alt={report.animalName}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute top-2 left-2 z-10">
              <span className={cn(reportTypeOverlayBase, reportTypeOverlayColors[report.type])}>
                {reportTypeLabels[report.type]}
              </span>
            </div>
            {extra > 0 && (
              <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                +{extra}
              </span>
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-wider text-muted-foreground">
            No photo
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="truncate text-sm font-semibold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
          {report.animalName}
        </h3>
        <p className="line-clamp-2 text-[11px] text-muted-foreground leading-relaxed">
          {report.location}
        </p>
        <p className="mt-auto text-[10px] text-muted-foreground">
          {formatDate(report.createdAt)}
        </p>
      </div>
    </button>
  )
}

function CategoryModal({ title, icon: Icon, iconBg, reports, open, onClose, onReportClick }: {
  title: string
  icon: typeof Search
  iconBg: string
  reports: PublicDomesticReport[]
  open: boolean
  onClose: () => void
  onReportClick: (report: PublicDomesticReport) => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 pt-8 pb-8 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl rounded-2xl bg-popover p-6 shadow-lg ring-1 ring-foreground/10 mx-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', iconBg)}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>{title}</h2>
              <p className="text-xs text-muted-foreground">{reports.length} accepted report{reports.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} onClick={() => onReportClick(report)} />
          ))}
        </div>
      </div>
    </div>
  )
}

function SectionGrid({ title, icon: Icon, iconBg, reports, empty, onViewMore, onReportClick }: {
  title: string
  icon: typeof Search
  iconBg: string
  reports: PublicDomesticReport[]
  empty: string
  onViewMore?: () => void
  onReportClick: (report: PublicDomesticReport) => void
}) {
  const maxVisible = 6
  const visible = reports.slice(0, maxVisible)

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', iconBg)}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>{title}</h2>
            <p className="text-xs text-muted-foreground">{reports.length} accepted report{reports.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onViewMore}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
        >
          View More
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      {reports.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-14 text-center text-sm text-muted-foreground">
          {empty}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {visible.map((report) => (
            <ReportCard key={report.id} report={report} onClick={() => onReportClick(report)} />
          ))}
        </div>
      )}
    </section>
  )
}

export function DomesticReportsPage() {
  const { domesticApprover } = useDomesticAuth()
  const [modalCategory, setModalCategory] = useState<'missing' | 'found' | null>(null)
  const [selectedReport, setSelectedReport] = useState<PublicDomesticReport | null>(null)

  const reports = useQuery(api.reports.listPublicDomestic)

  const loading = reports === undefined

  const missing = useMemo(
    () => (reports ?? []).filter((r) => r.type === 'missing'),
    [reports],
  )
  const found = useMemo(
    () => (reports ?? []).filter((r) => r.type === 'found'),
    [reports],
  )

  return (
    <div className="space-y-10">
      <section>
        <div className="mb-1 flex items-center gap-2 text-primary">
          <PawPrint className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-widest">Community Board</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl" style={{ fontFamily: 'var(--font-heading)' }}>
          {domesticApprover ? `Hello, ${domesticApprover.firstName}` : 'Domestic Reports'}
        </h1>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground leading-relaxed">
          Accepted missing and found animal reports from the community.
        </p>
      </section>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <SectionGrid
            title="Missing"
            icon={Search}
            iconBg="bg-rose-500/10 text-rose-500"
            reports={missing}
            empty="No accepted missing pet reports yet."
            onViewMore={() => setModalCategory('missing')}
            onReportClick={setSelectedReport}
          />

          <SectionGrid
            title="Found"
            icon={PawPrint}
            iconBg="bg-emerald-500/10 text-emerald-500"
            reports={found}
            empty="No accepted found animal reports yet."
            onViewMore={() => setModalCategory('found')}
            onReportClick={setSelectedReport}
          />
        </>
      )}

      <CategoryModal
        title="Missing"
        icon={Search}
        iconBg="bg-rose-500/10 text-rose-500"
        reports={missing}
        open={modalCategory === 'missing'}
        onClose={() => setModalCategory(null)}
        onReportClick={setSelectedReport}
      />

      <CategoryModal
        title="Found"
        icon={PawPrint}
        iconBg="bg-emerald-500/10 text-emerald-500"
        reports={found}
        open={modalCategory === 'found'}
        onClose={() => setModalCategory(null)}
        onReportClick={setSelectedReport}
      />

      <DomesticReportDetailDialog
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  )
}
