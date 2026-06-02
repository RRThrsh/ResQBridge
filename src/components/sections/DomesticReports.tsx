import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { ArrowRight, MapPin, Clock, Loader2, PawPrint } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import { Card, CardContent } from '@/components/ui/card'
import { formatMonthDay } from '@/lib/dates'
import {
  reportTypeLabels,
  reportTypeOverlayBase,
  reportTypeOverlayColors,
  speciesEmoji,
  type PublicDomesticReport,
} from '@/lib/domesticPublic'
import { getReportPhotos } from '@/lib/reportPhotos'
import { DomesticReportDetailDialog } from '@/components/report/DomesticReportDetailDialog'

export function DomesticReports() {
  const reports = useQuery(api.reports.listPublicDomestic)
  const [selectedReport, setSelectedReport] = useState<PublicDomesticReport | null>(null)

  return (
    <section id="domestic" className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        <div className="mb-10 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-primary">Community Board</p>
            <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              Domestic Reports
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Recent reports of missing, found, stray & injured domestic animals.
            </p>
          </div>
          <Link to="/report"
            className="group mt-4 sm:mt-0 inline-flex items-center gap-1 text-xs font-medium text-primary hover:opacity-80 transition-opacity shrink-0">
            Submit report
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {reports === undefined ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
            <PawPrint className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">No domestic reports yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Be the first to post a missing, found, stray, or injured animal report.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((r, i) => {
              const photos = getReportPhotos({ photoDataUrls: r.images, photoDataUrl: r.image })
              const cover = photos[0]

              return (
                <Card
                  key={r.id}
                  onClick={() => setSelectedReport(r)}
                  className="card-shimmer overflow-hidden border-border bg-card hover:border-primary/30 transition-colors duration-300 cursor-pointer animate-fade-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="relative h-44 overflow-hidden bg-muted">
                    {cover ? (
                      <img
                        src={cover}
                        alt={r.animalName}
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
                      <span
                        className={`${reportTypeOverlayBase} ${reportTypeOverlayColors[r.type]}`}
                      >
                        {reportTypeLabels[r.type]}
                      </span>
                    </div>
                    {photos.length > 1 ? (
                      <span className="absolute top-3 right-3 z-10 rounded-full border border-white/20 bg-black/75 px-2 py-0.5 text-[10px] font-semibold text-white shadow-md backdrop-blur-sm">
                        +{photos.length - 1}
                      </span>
                    ) : (
                      <div className="absolute top-3 right-3 text-lg leading-none">
                        {speciesEmoji(r.species)}
                      </div>
                    )}
                    <p
                      className="absolute bottom-3 left-3 text-sm font-bold text-white"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {r.animalName}
                      {r.species ? (
                        <span className="ml-1.5 font-normal text-white/70 text-xs">· {r.species}</span>
                      ) : null}
                    </p>
                  </div>

                  <CardContent className="p-4 space-y-2">
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {r.description}
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="h-3 w-3 text-primary/60" />
                        {r.location.split(',')[0]}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground ml-auto">
                        <Clock className="h-3 w-3 text-primary/60" />
                        {formatMonthDay(r.createdAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <DomesticReportDetailDialog
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      </div>
    </section>
  )
}
