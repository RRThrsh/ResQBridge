import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'convex/react'
import {
  CheckCircle2,
  Clock,
  Loader2,
  PawPrint,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import { useRescuerAuth } from '@/context/RescuerAuthContext'
import { normalizeEmail } from '@/lib/admin'
import { rescuerReportToStored } from '@/lib/reports'
import { formatDateTime } from '@/lib/dates'

type Tab = 'active' | 'rescued' | 'rejected'

const PAGE_SIZE = 15

const statusLabels: Record<string, string> = {
  accepted: 'Accepted',
  en_route: 'En Route',
  rescue_success: 'Rescued',
  rescue_failed: 'Failed',
}

const statusColors: Record<string, string> = {
  accepted: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
  en_route: 'bg-violet-500/15 text-violet-600 border-violet-500/30',
  rescue_success: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  rescue_failed: 'bg-red-500/15 text-red-600 border-red-500/30',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${statusColors[status] || 'bg-muted text-muted-foreground'}`}>
      {statusLabels[status] || status.replace(/_/g, ' ')}
    </span>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  active,
  onClick,
}: {
  label: string
  value: number
  icon: typeof Clock
  active?: boolean
  onClick?: () => void
}) {
  const Comp = onClick ? 'button' : 'div'

  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`flex flex-1 flex-col items-start rounded-2xl border p-4 text-left transition-all ${
        active
          ? 'border-primary/40 bg-primary/5 shadow-sm'
          : 'border-border bg-card/60 hover:border-border/80'
      }`}
    >
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${
        active ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
      }`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
        {value}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </Comp>
  )
}

function EmptyState({ tab }: { tab: Tab }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
        {tab === 'active' ? (
          <Clock className="h-6 w-6 text-primary" />
        ) : (
          <PawPrint className="h-6 w-6 text-primary" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
        {tab === 'active'
          ? 'No active dispatches'
          : tab === 'rescued'
            ? 'No rescued animals yet'
            : 'No rejected reports'}
      </h3>
      <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
        {tab === 'active'
          ? 'When admin assigns you a report, it will appear here for response.'
          : tab === 'rescued'
            ? 'Completed successful rescues will appear here.'
            : 'Reports marked as unsuccessful will appear here.'}
      </p>
    </div>
  )
}

export function RescuerReportsPage() {
  const { rescuer } = useRescuerAuth()
  const [tab, setTab] = useState<Tab>('active')
  const [page, setPage] = useState(1)
  const email = rescuer ? normalizeEmail(rescuer.email) : ''

  const activeRows = useQuery(
    api.rescuers.listAssignedReports,
    rescuer ? { rescuerEmail: email } : 'skip',
  )
  const completedRows = useQuery(
    api.rescuers.listCompletedReports,
    rescuer ? { rescuerEmail: email } : 'skip',
  )

  const active = useMemo(
    () => (activeRows ? activeRows.map(rescuerReportToStored) : []),
    [activeRows],
  )
  const completed = useMemo(
    () => (completedRows ? completedRows.map(rescuerReportToStored) : []),
    [completedRows],
  )

  const rescued = useMemo(
    () => completed.filter((r) => r.status === 'rescue_success'),
    [completed],
  )
  const rejected = useMemo(
    () => completed.filter((r) => r.status === 'rescue_failed'),
    [completed],
  )

  const loading = activeRows === undefined || completedRows === undefined
  const list = tab === 'active' ? active : tab === 'rescued' ? rescued : rejected

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = list.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <>
      <section className="mb-8">
        <div className="mb-1 flex items-center gap-2 text-primary">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-widest">Field dashboard</span>
        </div>
        <h2
          className="text-2xl font-bold text-foreground sm:text-3xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {rescuer ? `Hello, ${rescuer.firstName}` : 'Rescuer dashboard'}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Manage active dispatches and review animals you have already rescued.
        </p>
      </section>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="mb-8 flex gap-3">
            <StatCard
              label="Active now"
              value={active.length}
              icon={Clock}
              active={tab === 'active'}
              onClick={() => { setTab('active'); setPage(1) }}
            />
            <StatCard
              label="Rescued"
              value={rescued.length}
              icon={CheckCircle2}
              active={tab === 'rescued'}
              onClick={() => { setTab('rescued'); setPage(1) }}
            />
            <StatCard
              label="Rejected"
              value={rejected.length}
              icon={PawPrint}
              active={tab === 'rejected'}
              onClick={() => { setTab('rejected'); setPage(1) }}
            />
          </div>

          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="inline-flex rounded-xl border border-border bg-muted/40 p-1">
              {(
                [
                  ['active', 'Active'],
                  ['rescued', 'Rescued'],
                  ['rejected', 'Rejected'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => { setTab(value); setPage(1) }}
                  className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                    tab === value
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}
                  <span className="ml-1.5 tabular-nums text-muted-foreground">
                    ({value === 'active'
                      ? active.length
                      : value === 'rescued'
                        ? rescued.length
                        : rejected.length})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {list.length === 0 ? (
            <EmptyState tab={tab} />
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Report #</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Animal</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Species</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Location</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((report) => (
                      <tr
                        key={report.id}
                        className="border-b border-border transition-colors hover:bg-muted/30 cursor-pointer"
                        onClick={() => window.location.href = `/pwrcc/rescuer/reports/${report.id}`}
                      >
                        <td className="px-4 py-3 text-foreground font-mono text-[12px]">
                          {report.reportNumber || report.id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-4 py-3 text-foreground font-medium max-w-[140px] truncate">
                          {report.animalName}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground capitalize">{report.type}</td>
                        <td className="px-4 py-3 text-muted-foreground">{report.speciesId || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[160px] truncate">{report.location}</td>
                        <td className="px-4 py-3"><StatusBadge status={report.status} /></td>
                        <td className="px-4 py-3 text-muted-foreground text-[12px] whitespace-nowrap">{formatDateTime(report.createdAt)}</td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/pwrcc/rescuer/reports/${report.id}`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            title="View details"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    Page {safePage} of {totalPages} ({list.length} total)
                  </p>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={safePage >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  )
}
